const express = require('express');
const recommendations = require('../controllers/recommend.controller');
const router = express.Router();
const auth = require("../middleware/auth.middleware");

router.post('/content', recommendations.relatedProductsRecommend);

router.get('/personalized',auth.authUser, recommendations.personalizedProductRecommend);



module.exports = router; 