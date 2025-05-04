const express = require('express');
const router = express.Router();
const authController = require("../controllers/auth.controller")
const auth = require("../middleware/auth.middleware")
const sellerController = require("../controllers/seller.controller")

router.post('/google', authController.googleAuth);

router.get('/get-otp', auth.authUser, authController.OtpGenerator)

router.post('/verify-otp',auth.authUser, authController.verifyOtp, sellerController.updateToSeller)


module.exports = router; 