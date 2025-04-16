const productModel = require("../models/product.model")

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

module.exports.getProduct = async (req, res, next) => {
  const { id } = req.params;
  try {
    const product = await productModel.findById(id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.status(200).json({ product });
  } catch (error) {
    console.error("Error fetching product:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
