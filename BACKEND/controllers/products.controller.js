const Product = require('../models/product.model');

// Fetch all products with optional filters, search, and pagination
exports.fetchFilteredProducts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize) || 15));
    const { category, subcategory } = req.query;

    // Search query can be passed as `search` or `query`
    const searchQuery = req.query.search || req.query.query;

    if (searchQuery && searchQuery.trim().length > 0) {
      const regex = new RegExp(searchQuery.trim(), 'i'); // case-insensitive

      const filter = {
        $or: [
          { title: regex },
          { description: regex },
          { brand: regex },
          { category: regex },
          { subcategory: regex },
          { tags: { $in: [regex] } },
        ],
      };

      const [totalProducts, products] = await Promise.all([
        Product.countDocuments(filter),
        Product.find(filter)
          .skip((page - 1) * pageSize)
          .limit(pageSize)
          .exec(),
      ]);

      return res.status(200).json({
        success: true,
        totalProducts,
        totalPages: Math.ceil(totalProducts / pageSize),
        currentPage: page,
        pageSize,
        products,
      });
    }

    // No search query, normal filter logic
    const filter = {};
    if (category) filter.category = category;
    if (subcategory) filter.subcategory = { $in: Array.isArray(subcategory) ? subcategory : [subcategory] };

    const [totalProducts, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .exec(),
    ]);

    res.status(200).json({
      success: true,
      totalProducts,
      totalPages: Math.ceil(totalProducts / pageSize),
      currentPage: page,
      pageSize,
      products,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

// Fetch products by category
exports.fetchProductsOnCategory = async (req, res) => {
  try {
    const { category } = req.body;
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category is required',
      });
    }

    const products = await Product.aggregate([
      { $match: { category } },
      { $sample: { size: 10 } },
    ]);

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

// Fetch a single product by ID
exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

// Fetch products for wishlist by ID (same as getProduct)
exports.getWishListProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Error fetching wishlist product:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};
