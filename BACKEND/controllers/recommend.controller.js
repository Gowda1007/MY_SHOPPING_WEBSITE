const { default: axios } = require("axios");
const productModel = require("../models/product.model")

module.exports.relatedProductsRecommend = async (req, res, next) => {
  const { productId } = req.body;
  try {
    const response = await axios.get(
      `${process.env.RECOMMENDATION_SERVICE}/recommendations/content/${productId}`
    );
    console.log("response from flask", response)

    const products = await productModel.find({
      _id: { $in: response.data }
    });

    if (!products) {
      return res.status(404).json({ error: "Products not found" });
    }
    return res.status(200).json({ products });
  } catch (error) {
    console.error("Error fetching product:", error);
    return res.status(500).json({ error: 'Failed to get recommendations',error });
  }
};


module.exports.personalizedProductRecommend = async (req, res, next) => {
  try {
    const response = await axios.get(
      `${process.env.RECOMMENDATION_SERVICE}/recommendations/personalized/${req.user._id}`
    );

    const products = await productModel.find({
      _id: { $in: response.data }
    });

    if (!products || products.length === 0) {
      return res.status(404).json({ error: "Products not found" });
    }

    res.status(200).json({ products });
  } catch (error) {
    console.error("Error fetching personalized product recommendations:", error);
    res.status(500).json({ error: "Failed to fetch personalized product recommendations" });
  }
};