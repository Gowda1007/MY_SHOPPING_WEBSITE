const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const blacklistToken = require('../models/blacklistToken.model')

module.exports.authUser = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized Access" });

  const isBlacklisted = await blacklistToken.findOne({token:token})
  if(isBlacklisted) return res.status(401).json({ message: "Unauthorized Access" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded._id).select("-password"); 
      console.log(user)
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized access" });
  }
};

module.exports.authSeller = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized Access" });

  const isBlacklisted = await blacklistToken.findOne({token:token})
  if(isBlacklisted) return res.status(401).json({ message: "Unauthorized Access" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const seller = await userModel.findById(decoded._id).select("-password");

    if (!seller || seller.role !== "seller") {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    req.seller = seller;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized access" });
  }
};

module.exports.validateUser = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    
    
    const isBlacklisted = await blacklistToken.findOne({ token });
    if (!token || isBlacklisted) {
      return res.json({ valid: false });
    }

    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userExists = await userModel.exists({ _id: decoded._id });
    
    return res.json({ valid: !!userExists });
  } catch (error) {
    return res.json({ valid: false });
  }
};