const express = require('express');
const router = express.Router();
const productsController = require('../controllers/products.controller');

// Combine search & filter in fetchFilteredProducts
router.get('/', productsController.fetchFilteredProducts);

router.post('/category', productsController.fetchProductsOnCategory);

router.get('/:id', productsController.getProduct);

router.get('/wishlist/:id', productsController.getWishListProducts);

module.exports = router;