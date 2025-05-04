const { default: axios } = require("axios");
const { oauth2client } = require("../utils/googleConfig");
const { passwordGenerator } = require("../utils/randomPasswordGenerator");
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const OtpGenerator = require("../services/otpService");
const twilio = require("twilio");
const { json } = require("express");


module.exports.googleAuth = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Authorization code is required" });
    }

    const { tokens } = await oauth2client.getToken(code);
    oauth2client.setCredentials(tokens);

    const { data } = await axios.get(
      "https://www.googleapis.com/oauth2/v1/userinfo",
      {
        params: { alt: "json", access_token: tokens.access_token },
      }
    );

    const { email, name, picture } = data;

    return res
      .status(200)
      .json({
        email,
        name,
        picture,
        password: passwordGenerator(email + name + `${process.env.JWT_SECRET}`),
      });
  } catch (error) {
    console.error(
      "Google Authentication Error:",
      error.response?.data || error.message
    );
    return res.status(500).json({ error: "Internal Server Error" });

  }
};


module.exports.OtpGenerator = async (req, res ,next) => {
  try {
    const userPhone = req.user?.phone;

    if (!userPhone) {
      return res.status(400).json({ message: "User phone number is required" });
    }

    const client = twilio(accountSid, authToken);
    const generatedOtp = await OtpGenerator.generateOtp(6);

    await OtpGenerator.saveOtp(req.user._id, generatedOtp)

    const message = await client.messages.create({
      body: `Your One-Time Password (OTP) for verifying your seller account on My Shop is ${generatedOtp}. Do not share this code with anyone.`,
      to: `+91${userPhone}`,
      from: process.env.TWILIO_PHONE_NUMBER,
    });

    if (message.errorCode === null) {
      return res.status(200).json({ message: "OTP sent successfully" });
    } else {
      return res.status(500).json({ message: "Failed to send OTP", error: message.errorMessage });
    }

  } catch (error) {
    console.error("OTP send error:", error);
    return res.status(500).json({ message: "An error occurred while sending OTP", error: error.message });
  }
};

module.exports.verifyOtp = async (req, res, next) => {
  try {
    const userId = req.user._id
    const { otp: enteredOtp } = req.body

    if (!enteredOtp || enteredOtp.isNaN) {
      res.status(404).json({ message: "Enter valid OTP" })
    }

    const isOtpVerified = await OtpGenerator.verifyOtp(userId, enteredOtp)

    if (isOtpVerified) {
      return next()
    }
    return res.status(400).json({ message: "Invalid OTP" });
  } catch (error) {
    console.error("OTP verify error:", error);
    return res.status(500).json({ message: "An error occurred while verifing OTP", error: error.message });
  }
}