const Product = require('../models/product.model');
const userModel = require("../models/user.model");
const userService = require("../services/user.service");
const { validationResult } = require("express-validator");
const blacklistToken = require("../models/blacklistToken.model");
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
  console.log(req.body);
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

module.exports.toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;

    const user = await userModel.findById(userId);
    const index = user.wishListProducts.indexOf(productId);

    if (index > -1) {
      user.wishListProducts.splice(index, 1);
    } else {
      user.wishListProducts.push(productId);
    }

    await user.save();
    res.status(200).json({ message: "Wishlist updated successfully" });
  } catch (err) {
  }
};

// user.controller.js
module.exports.getCart = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id)
      .populate({
        path: 'cartProducts.productId',
        model: 'product', 
        select: 'title price image oldPrice' 
      });

    if (!user) {
      return res.status(404).json({ message: 'User  not found' });
    }

    res.status(200).json({ cartProducts: user.cartProducts });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Error fetching cart', error: error.message });
  }
};

module.exports.getWishlist = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id)
      .populate({
        path: 'wishListProducts', // Correctly populate wishListProducts
        model: 'product', 
        select: 'title price image' 
      });

    if (!user) {
      return res.status(404).json({ message: 'User  not found' });
    }

    res.status(200).json({ 
      wishListProducts: user.wishListProducts 
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ 
      message: 'Error fetching wishlist',
      error: error.message 
    });
  }
};

// For cart bulk update
module.exports.bulkUpdateCart = async (req, res) => {
  try {
    await userModel.findByIdAndUpdate(req.user._id, {
      cartProducts: req.body.products.map(item => ({
        productId: item.product, // Match frontend field name
        quantity: item.quantity,
        size: item.size
      }))
    });
    res.status(200).json({ message: 'Cart updated successfully' });
  } catch (error) {
    console.error('Bulk cart update error:', error);
    res.status(500).json({ message: 'Error updating cart', error: error.message });
  }
};

// For wishlist bulk update
module.exports.bulkUpdateWishlist = async (req, res) => {
  try {
    await userModel.findByIdAndUpdate(req.user._id, {
      wishListProducts: req.body.products.map(id => ({
        productId: id // Direct ID mapping
      }))
    });
    res.status(200).json({ message: 'Wishlist updated successfully' });
  } catch (error) {
    console.error('Bulk wishlist update error:', error);
    res.status(500).json({ message: 'Error updating wishlist', error: error.message });
  }
};

module.exports.logoutUser = async (req, res, next) => {
  res.clearCookie("token");
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  await blacklistToken.create({ token });

  return res.status(200).json({ message: "Logged out successfully" });
};
