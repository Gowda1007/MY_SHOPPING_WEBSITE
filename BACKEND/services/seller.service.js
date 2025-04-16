const userModel = require("../models/user.model");


module.exports.createSeller = async (userId) => {
    try {
      const seller = await userModel.findByIdAndUpdate(
        userId,
        { role: "seller" },
        { new: true, runValidators: true }
      );
      if (!seller) {
        throw new Error("User not found. You must register as a user first.");
      }
      return seller;
    } catch (error) {
      throw error;
    }
  };