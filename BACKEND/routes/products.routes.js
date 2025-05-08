const express = require('express');
const router = express.Router();
const productsController = require('../controllers/products.controller')

// Proper route setup with controller functions
router.get('/', productsController.fetchFilteredProducts);


router.post('/category', productsController.fetchProductsOnCategory);

router.get('/search', productsController.searchProducts);

router.get('/:id', productsController.getProduct);

module.exports = router; 
