const { default: axios } = require("axios");
const { oauth2client } = require("../utils/googleConfig");
const { passwordGenerator } = require("../utils/randomPasswordGenerator");

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

