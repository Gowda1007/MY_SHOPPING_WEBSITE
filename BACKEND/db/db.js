const mongoose = require('mongoose');
require('../models/product.model');
require('../models/user.model');
require('../models/blacklistToken.model');
require('../models/order.model');
require("../models/interaction.model");
require('../models/otp.model');

const connectToDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('✅ Successfully connected to the database');
    } catch (error) {
        console.error('❌ Error connecting to the database:', error.message);
        process.exit(1);
    }
};

module.exports = connectToDb;
