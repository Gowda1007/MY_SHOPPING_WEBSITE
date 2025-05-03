const productModel = require('../models/product.model');
const userModel = require("../models/user.model");
const userService = require("../services/user.service");
const { validationResult } = require("express-validator");
const blacklistToken = require("../models/blacklistToken.model");
const interactionModel = require('../models/interaction.model');

module.exports.registerUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, phone, password, picture } = req.body;

  const isExistingUser = await userModel.findOne({ email });
  if (isExistingUser) {
    return res
      .status(500)
      .json({ message: "User exists with this Email Please Login" });
  }

  const profilePhotoUrl = picture ? picture : "";
  const hashedPassword = await userModel.hashPassword(password);
  const profileImage = await userService.downloadProfilePhoto(
    profilePhotoUrl,
    email
  );

  try {
    const user = await userService.createUser({
      username,
      email,
      phone,
      password: hashedPassword,
      image: `/users/${profileImage}`,
    });

    const token = await user.generateAuthToken();
    return res.status(200).json({
      message: "User Created successfully",
      token,
      user: {
        username: user.username,
        email: user.email,
        phone: user.phone,
        image: user.image ? user.image : "",
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
  }
};

module.exports.loginUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({ message: "Invalid email or password" });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(404).json({ message: "Invalid email or password" });
    }

    const token = await user.generateAuthToken();
    return res.status(200).json({
      message: "Logged in successfully",
      token,
      user: {
        username: user.username,
        email: user.email,
        phone: user.phone,
        image: user.image ? user.image : "",
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

module.exports.getUserProfile = async (req, res, next) => {
  res.status(200).json(req.user);
};

module.exports.updateCart = async (req, res, next) => {
  try {
    const { productId, quantity, size = "" } = req.body;
    const userId = req.user._id;


    const user = await userModel.findById(userId);
    if (!user.cartProducts) {
      user.cartProducts = [];
    }

    if (quantity === 0) {

      await userModel.findOneAndUpdate(
        { _id: userId },
        { $pull: { cartProducts: { productId } } }
      );
    } else {

      const existingProduct = user.cartProducts.find(p => p.productId === productId);

      if (existingProduct) {

        await userModel.findOneAndUpdate(
          { _id: userId, "cartProducts.productId": productId },
          {
            $set: {
              "cartProducts.$.quantity": quantity,
              "cartProducts.$.size": size,
            }
          }
        );
      } else {

        await userModel.findOneAndUpdate(
          { _id: userId },
          { $push: { cartProducts: { productId, quantity, size } } }
        );
      }
    }


    res.status(200).json({ message: "Cart updated successfully" });
  } catch (err) {
    console.error(err);
  }
};

// Main toggle function
module.exports.toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await userModel.findById(req.user._id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Find index using productId
    const index = user.wishListProducts.findIndex(
      item => item.productId === productId
    );

    if (index > -1) {
      user.wishListProducts.splice(index, 1);
    } else {
      // Add new item with correct structure
      user.wishListProducts.push({ productId });
    }

    await user.save();
    res.status(200).json({ message: "Wishlist updated" });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// user.controller.js
module.exports.getCart = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id)
      .populate({
        path: 'cartProducts.productId',
        model: 'product',
        select: '-reviews -__v' 
      });

    if (!user) return res.status(404).json({ cartProducts: [] });

    const formattedCart = user.cartProducts.map(item => ({
      product: item.productId, 
      quantity: item.quantity,
      size: item.size,
      _id: item._id
    }));

    res.status(200).json({ cartProducts: formattedCart });
  } catch (error) {
    console.error("Backend getCart error:", error);
    res.status(500).json({ cartProducts: [] });
  }
};



module.exports.getWishlist = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ wishListProducts: [] });
    }
    res.status(200).json({ wishListProducts: user.wishListProducts || [] });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ wishListProducts: [] });
  }
};

// For cart bulk update
module.exports.bulkUpdateCart = async (req, res) => {
  try {
    const { products } = req.body;
    
    // Enhanced validation
    const isValid = Array.isArray(products) && products.every(item => 
      item.productId && 
      typeof item.quantity === 'number' && 
      item.quantity > 0
    );
    
    if (!isValid) return res.status(400).json({ message: "Invalid cart data" });

    await userModel.findByIdAndUpdate(
      req.user._id,
      { cartProducts: products },
      { new: true, runValidators: true }
    );

    res.status(200).json({ message: "Cart updated successfully" });
  } catch (error) {
    console.error("Backend bulkUpdateCart error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// For wishlist bulk update
module.exports.bulkUpdateWishlist = async (req, res) => {
  try {
    const { products } = req.body; // Expects array of objects

    // Validate structure
    if (!Array.isArray(products) || !products.every(p => p.productId)) {
      return res.status(400).json({ message: 'Invalid wishlist format' });
    }

    await userModel.findByIdAndUpdate(req.user._id, {
      wishListProducts: products
    });

    res.status(200).json({ message: 'Wishlist updated successfully' });
  } catch (error) {
    console.error('Bulk wishlist update error:', error);
    res.status(500).json({ message: 'Error updating wishlist' });
  }
};

module.exports.logoutUser = async (req, res, next) => {
  res.clearCookie("token");
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  await blacklistToken.create({ token });

  return res.status(200).json({ message: "Logged out successfully" });
};


module.exports.createInteraction = async (req, res, next) => {
  const { productId, type } = req.body;
  const userId = req.user._id;

  if (!productId || !type) {
    return res.status(400).json({ message: 'Product ID and type are required' });
  }

  try {
    const interaction = await interactionModel.create({
      interactionDate: new Date(),
      userId,
      productId,
      type
    });

    res.status(201).json({ message: 'Interaction created successfully', interaction });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(400).json({ message: 'Failed to create interaction', error: error.message });
  }
};
