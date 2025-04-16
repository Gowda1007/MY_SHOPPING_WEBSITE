const userModel = require("../models/user.model");
const sellerService = require("../services/seller.service");
const { validationResult } = require("express-validator");

module.exports.updateToSeller = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const userId = req.user._id;
    const seller = await sellerService.createSeller(userId);
    if (seller && seller.role === "seller") {
      return res.status(200).json({
        message: "User updated to seller successfully",
        seller: {
          _id: seller._id,
          username: seller.username,
          email: seller.email,
          phone: seller.phone,
        },
      });
    }
    return res.status(500).json({ message: "Something went wrong" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

module.exports.loginSeller = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;
  try {
    const seller = await userModel.findOne({ email }).select("+password");
    if (!seller || seller.role !== "seller") {
      return res.status(404).json({ message: "Invalid Email or Password" });
    }
    const isValidSeller = await seller.comparePassword(password);
    if (!isValidSeller) {
      return res.status(404).json({ message: "Invalid Email or Password" });
    }
    const token = await seller.generateAuthToken();
    return res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 2 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        message: "Seller Login Successfull",
        token,
        seller: {
          _id: seller._id,
          username: seller.username,
          email: seller.email,
          phone: seller.phone,
        },
      });
  } catch (error) {
    throw error;
  }
};

module.exports.getSellerProfile = async (req, res, next) => {
  res.status(200).json(req.seller);
};

module.exports.logoutSeller = async (req, res, next) => {
  res.clearCookie("token");
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  await blacklistToken.create({ token });

  return res.status(200).json({ message: "Logged out successfully" });
};
