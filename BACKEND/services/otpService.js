const crypto = require('crypto');
const OtpModel = require('../models/otp.model');

const generateOtp = async (length = 6) => {
    if (length <= 0) throw new Error("OTP length must be greater than 0");
    const otp = crypto.randomBytes(length).toString('hex').slice(0, length);
    return Array.from(otp).map(char => parseInt(char, 16) % 10).join('');
};


const saveOtp = async (userId, otp) => {
    await OtpModel.deleteMany({ userId });
    await OtpModel.create({ userId, otp });
};

const verifyOtp = async (userId, enteredOtp) => {
    const otpEntry = await OtpModel.findOne({ userId });
    if (!otpEntry) return false;

    const isValid = otpEntry.otp === enteredOtp;
    if (isValid) await OtpModel.deleteOne({ _id: otpEntry._id });
    return isValid;
};

module.exports = { generateOtp, saveOtp, verifyOtp };
