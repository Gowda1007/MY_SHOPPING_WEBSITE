const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const userController = require("../controllers/user.controller");
const auth = require("../middleware/auth.middleware");

router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Invalid Email"),
    body("username")
      .isLength({ min: 3 })
      .withMessage("Name must be atleast 3 characters long"),
    body("phone")
      .isLength({ min: 10 })
      .withMessage("Phone number must be atleast 10 characters long"),
    body("password")
      .isLength({ min: 5 })
      .withMessage("Password must be atleast 5 characters long"),
  ],
  userController.registerUser
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid Email"),
    body("password")
      .isLength({ min: 5 })
      .withMessage("Password must be atleast 5 characters long"),
  ],
  userController.loginUser
);

router.get("/profile", auth.authUser, userController.getUserProfile);

router.get("/isvaliduser", auth.validateUser);

router.post("/cart", auth.authUser, userController.updateCart);

router.post("/wishlist", auth.authUser, userController.toggleWishlist);

router.get("/cart", auth.authUser, userController.getCart);

router.get("/wishlist", auth.authUser, userController.getWishlist);

router.post("/cart/bulk", auth.authUser, userController.bulkUpdateCart);

router.post("/wishlist/bulk", auth.authUser, userController.bulkUpdateWishlist);

router.get("/logout", auth.authUser, userController.logoutUser);

module.exports = router;
