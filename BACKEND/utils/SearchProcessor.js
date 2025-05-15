// const nlp = require('compromise');
// const spellcheck = require('spellchecker'); 
// const levenshtein = require('fast-levenshtein'); 


// exports.processSearchQuery = (rawQuery) =>{
//     // Normalize query
//     let processed = rawQuery.toLowerCase().trim();

//     // Step 1: Spelling Correction
//     processed = correctSpelling(processed);

//     // Step 2: NLP Parsing
//     const nlpDoc = nlp(processed);

//     // Step 3: Extract Components
//     const components = {
//         intent: detectIntent(nlpDoc),
//         price: extractPriceData(processed),
//         features: extractFeatures(nlpDoc),
//         brand: extractBrand(nlpDoc),
//         category: extractCategory(nlpDoc),
//         synonyms: expandSynonyms(processed)
//     };

//     // Step 4: Build Filters
//     const filters = {};

//     if (components.price) {
//         filters.price = components.price.range;
//     }

//     if (components.brand) {
//         filters.brand = { $regex: components.brand, $options: 'i' };
//     }

//     if (components.features.length > 0) {
//         filters.$or = [
//             { tags: { $in: components.features } },
//             { description: { $regex: components.features.join('|'), $options: 'i' } }
//         ];
//     }

//     if (components.category) {
//         filters.category = { $regex: components.category, $options: 'i' };
//     }

//     // Combine search terms
//     const searchTerms = [
//         ...new Set([
//             ...components.synonyms,
//             ...components.features,
//             components.brand || '',
//             components.category || '',
//             ...(components.intent.keywords || [])
//         ])
//     ].join(' ');

//     return { filters, searchTerms, intent: components.intent };
// }

// // =====================
// // HELPER FUNCTIONS
// // =====================
// function correctSpelling(query) {
//     if (!spellcheck || typeof spellcheck.getCorrections !== 'function') return query;

//     return query.split(' ').map(word => {
//         const suggestions = spellcheck.getCorrectionsForMisspelling(word);
//         return suggestions && suggestions.length > 0 ? suggestions[0] : word;
//     }).join(' ');
// }

// function detectIntent(nlpDoc) {
//     const intent = {
//         sort: { price: 1 },  // Default: low to high
//         keywords: []
//     };

//     if (nlpDoc.match('#Adjective').has('cheap affordable budget')) {
//         intent.sort = { price: 1 };
//         intent.keywords.push('affordable');
//     }

//     if (nlpDoc.match('#Adjective').has('best top rated')) {
//         intent.sort = { rating: -1 };
//         intent.keywords.push('rated');
//     }

//     if (nlpDoc.has('latest new recent')) {
//         intent.sort = { createdAt: -1 };
//         intent.keywords.push('new');
//     }

//     if (nlpDoc.has('expensive premium luxury')) {
//         intent.sort = { price: -1 };
//         intent.keywords.push('premium');
//     }

//     return intent;
// }

// function extractPriceData(query) {
//     const pricePatterns = [
//         /(under|below|less than)\s+([₹$]?)(\d+)/i,
//         /(over|above|more than)\s+([₹$]?)(\d+)/i,
//         /between\s+([₹$]?)(\d+)\s+and\s+([₹$]?)(\d+)/i,
//         /([₹$])(\d+)\s*-\s*([₹$]?)(\d+)/i
//     ];

//     for (const pattern of pricePatterns) {
//         const match = query.match(pattern);
//         if (match) {
//             if (pattern.source.includes('between')) {
//                 return {
//                     range: {
//                         $gte: parseInt(match[2]),
//                         $lte: parseInt(match[4])
//                     },
//                     raw: match[0]
//                 };
//             } else {
//                 const direction = match[1].toLowerCase();
//                 return {
//                     range: {
//                         [direction === 'over' || direction === 'above' || direction === 'more than' ? '$gte' : '$lte']: parseInt(match[3])
//                     },
//                     raw: match[0]
//                 };
//             }
//         }
//     }
//     return null;
// }

// function expandSynonyms(query) {
//     return query.split(' ').flatMap(word => {
//         const syns = synonyms(word) || [];
//         return [word, ...syns].slice(0, 3);
//     });
// }

// // Dummy synonym map function
// function synonyms(word) {
//     const synonymMap = {
//         cheap: ['affordable', 'budget'],
//         expensive: ['premium', 'luxury'],
//         fast: ['quick', 'speedy'],
//         wireless: ['cordless', 'untethered']
//     };
//     return synonymMap[word] || [];
// }

// function extractFeatures(nlpDoc) {
//     const features = [];
//     const featureDictionary = ['fleece', 'ssd', 'weatherproof', 'wireless', 'bluetooth', 'touchscreen', 'portable', 'durable', 'fast-charging'];

//     const terms = [
//         ...nlpDoc.nouns().out('array'),
//         ...nlpDoc.adjectives().out('array')
//     ].map(t => t.toLowerCase());

//     terms.forEach(term => {
//         featureDictionary.forEach(feature => {
//             if (levenshtein.get(term, feature) <= 2) {
//                 features.push(feature);
//             }
//         });
//     });

//     return [...new Set(features)];
// }

// function extractBrand(nlpDoc) {
//     const brands = ['nike', 'adidas', 'puma', 'samsung', 'apple', 'sony'];
//     const terms = nlpDoc.terms().out('array').map(t => t.toLowerCase());
//     return brands.find(brand => terms.includes(brand));
// }

// function extractCategory(nlpDoc) {
//     const categories = ['clothing', 'electronics', 'footwear', 'accessories'];
//     const terms = nlpDoc.terms().out('array').map(t => t.toLowerCase());
//     return categories.find(cat => terms.includes(cat));
// }

// function getSortCriteria(intent) {
//     return intent.sort;
// }
