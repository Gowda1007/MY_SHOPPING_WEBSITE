const natural = require('natural');
const nlp = require('compromise');
const synonyms = require('synonyms');
const levenshtein = require('fast-levenshtein');
const productModel = require("../models/product.model");

// Initialize NLP components
const stemmer = natural.PorterStemmer;
const spellcheck = new natural.Spellcheck(['nike', 'joggers', 'fleece', 'sportswear']); 

module.exports.fetchFilteredProducts = async (req, res, next) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize) || 15));
        const { category, subcategory } = req.query;

        const filter = {};

        if (category) {
            filter.category = category;
        }

        if (subcategory) {
            const subcategories = Array.isArray(subcategory) ? subcategory : [subcategory];
            filter.subcategory = { $in: subcategories };
        }

        const [totalProducts, products] = await Promise.all([
          productModel.countDocuments(filter),
            productModel.find(filter)
                .skip((page - 1) * pageSize)
                .limit(pageSize)
                .exec()
        ]);

        res.status(200).json({
            success: true,
            totalProducts,
            totalPages: Math.ceil(totalProducts / pageSize),
            currentPage: page,
            pageSize,
            products
        });

    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal Server Error',
            error: error.message
        });
    }
};

module.exports.fetchProductsOnCategory = async (req, res, next) => {
    try {
        const { category } = req.body; // Extract only the category from the request body

        const filter = {};

        if (category) {
            filter.category = category;
        } else {
            // If category is not provided, return a 400 Bad Request response
            res.status(400).json({ 
                success: false, 
                message: 'Category is required'
            });
            return;
        }

        const randomProducts = await productModel.aggregate([
            { $match: filter },
            { $sample: { size: 10 } }
        ]);

        res.status(200).json({
            success: true,
            products: randomProducts
        });

    } catch (error) {
        console.error('Error fetching random products:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal Server Error',
            error: error.message
        });
    }
};


module.exports.searchProducts = async (req, res, next) => {
    try {
        const { searchQuery } = req.query;
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize) || 15));
        
        if (!searchQuery) {
            return res.status(400).json({ 
                success: false, 
                message: 'Search query is required' 
            });
        }

        // --------------------------
        // Advanced Query Processing
        // --------------------------
        const processedQuery = await processSearchQuery(searchQuery);

        // --------------------------
        // Build MongoDB Query
        // --------------------------
        const finalQuery = {
            ...processedQuery.filters,
            $text: { $search: processedQuery.searchTerms }
        };

        const sort = getSortCriteria(processedQuery.intent);
        
        // --------------------------
        // Execute Search
        // --------------------------
        const [totalProducts, products] = await Promise.all([
            productModel.countDocuments(finalQuery),
            productModel.find(finalQuery)
                .sort(sort)
                .skip((page - 1) * pageSize)
                .limit(pageSize)
                .exec()
        ]);

        res.status(200).json({
            success: true,
            totalProducts,
            totalPages: Math.ceil(totalProducts / pageSize),
            currentPage: page,
            pageSize,
            products
        });

    } catch (error) {
        console.error('Error processing search:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal Server Error',
            error: error.message
        });
    }
};

// ==================================
// Advanced Query Processing Pipeline
// ==================================
async function processSearchQuery(rawQuery) {
    // Normalize query
    let processed = rawQuery.toLowerCase().trim();
    
    // Step 1: Spelling Correction
    processed = correctSpelling(processed);
    
    // Step 2: NLP Parsing
    const nlpDoc = nlp(processed);
    
    // Step 3: Extract Components
    const components = {
        intent: detectIntent(nlpDoc),
        price: extractPriceData(processed),
        features: extractFeatures(nlpDoc),
        brand: extractBrand(nlpDoc),
        category: extractCategory(nlpDoc),
        synonyms: expandSynonyms(processed)
    };

    // Step 4: Build Filters
    const filters = {};
    
    // Price Filter
    if (components.price) {
        filters.price = components.price.range;
    }

    // Brand Filter
    if (components.brand) {
        filters.brand = { $regex: components.brand, $options: 'i' };
    }

    // Feature Filter
    if (components.features.length > 0) {
        filters.$or = [
            { tags: { $in: components.features } },
            { description: { $regex: components.features.join('|'), $options: 'i' } }
        ];
    }

    // Category Filter
    if (components.category) {
        filters.category = { $regex: components.category, $options: 'i' };
    }

    // Combine search terms
    const searchTerms = [
        ...new Set([
            ...components.synonyms,
            ...components.features,
            components.brand,
            components.category,
            components.intent.keywords
        ].filter(Boolean))
    ].join(' ');

    return { filters, searchTerms, intent: components.intent };
}

// =====================
// Helper Functions
// =====================
function correctSpelling(query) {
    return query.split(' ').map(word => {
        const suggestions = spellcheck.getCorrections(word, 1);
        return suggestions.length > 0 ? suggestions[0] : word;
    }).join(' ');
}

function detectIntent(nlpDoc) {
    const intent = {
        sort: { price: 1 },  // Default sort
        keywords: []
    };

    // Detect comparison adjectives
    if (nlpDoc.match('#Adjective').has('cheap affordable budget')) {
        intent.sort = { price: 1 };
        intent.keywords.push('affordable');
    }
    
    if (nlpDoc.match('#Adjective').has('best top rated')) {
        intent.sort = { rating: -1 };
        intent.keywords.push('rated');
    }

    if (nlpDoc.has('latest new recent')) {
        intent.sort = { createdAt: -1 };
        intent.keywords.push('new');
    }

    return intent;
}

function extractPriceData(query) {
    const pricePatterns = [
        /(under|below|less than)\s+([₹$]?)(\d+)/i,
        /(over|above|more than)\s+([₹$]?)(\d+)/i,
        /between\s+([₹$]?)(\d+)\s+and\s+([₹$]?)(\d+)/i,
        /([₹$])(\d+)\s*-\s*([₹$]?)(\d+)/i
    ];

    for (const pattern of pricePatterns) {
        const match = query.match(pattern);
        if (match) {
            if (pattern.source.includes('between')) {
                return {
                    range: {
                        $gte: parseInt(match[2]),
                        $lte: parseInt(match[4])
                    },
                    raw: match[0]
                };
            } else {
                return {
                    range: {
                        [match[1].toLowerCase() === 'over' ? '$gte' : '$lte']: parseInt(match[3])
                    },
                    raw: match[0]
                };
            }
        }
    }
    return null;
}

function expandSynonyms(query) {
    return query.split(' ').flatMap(word => {
        const syns = synonyms(word) || [];
        return [word, ...syns].slice(0, 3); // Limit to 3 synonyms
    });
}

function extractFeatures(nlpDoc) {
    const features = [];
    
    // Extract nouns and adjectives
    const terms = [
        ...nlpDoc.nouns().out('array'),
        ...nlpDoc.adjectives().out('array')
    ];

    // Match with known features from product schema
    const featureDictionary = ['fleece', 'ssd', 'weatherproof', 'wireless'];
    
    terms.forEach(term => {
        // Find closest matching feature
        featureDictionary.forEach(feature => {
            if (levenshtein.get(term, feature) <= 2) {
                features.push(feature);
            }
        });
    });

    return [...new Set(features)];
}

function extractBrand(nlpDoc) {
    const brands = ['nike', 'adidas', 'puma']; // Add your brand list
    return brands.find(brand => nlpDoc.has(brand));
}

function extractCategory(nlpDoc) {
    const categories = ['clothing', 'electronics', 'footwear'];
    return categories.find(cat => nlpDoc.has(cat));
}

function getSortCriteria(intent) {
    return intent.sort;
}


module.exports.getProduct = async (req, res, next) => {
    const { id } = req.params;
    try {
      const product = await productModel.findById(id);
  
      if (!product) {
        return res.status(404).json({ error: "Product 234 not found" });
      }
  
      return res.status(200).json({ product });
    } catch (error) {
      console.error("Error fetching product:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };
