const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const sellerController = require("../controllers/seller.controller");
const auth = require("../middleware/auth.middleware");

router.post("/register",auth.authUser, sellerController.updateToSeller);

router.post("/login", [
  body("email").isEmail().withMessage("Invalid Email"),
  body("password")
    .isLength({ min: 5 })
    .withMessage("Password must be atleast 5 characters long"),
],sellerController.loginSeller
);

router.get("/profile",auth.authSeller, sellerController.getSellerProfile);

router.get("/logout",auth.authSeller,sellerController.logoutSeller)

router.get("/orders",auth.authSeller,sellerController.getSellerOrders)

module.exports = router;
