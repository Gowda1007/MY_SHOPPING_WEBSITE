const mime = require("mime");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const sharp = require("sharp");
const userModel = require("../models/user.model");

module.exports.createUser = async ({ username, email, phone, password,image }) => {
  if (!username || !email || !phone || !password) {
    throw new Error("All fields are required");
  }

  try {
    const user = await userModel.create({
      username,
      email,
      phone,
      password,
      image
    });

    return user;
  } catch (error) {
    throw error;
  }
};

module.exports.downloadProfilePhoto = async (imageUrl, email) => {
  try {
    const folder = path.join(__dirname, "../public/users");
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    if (!email || !email.includes("@")) {
      throw new Error("Invalid email format");
    }

    const filenameBase = email.split("@")[0];
    const response = await axios({
      url: imageUrl,
      method: "GET",
      responseType: "stream",
    });

    if (response.status !== 200) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const mimeType = response.headers["content-type"];
    const ext = mime.extension(mimeType) || path.extname(imageUrl).slice(1);
    if (!ext || !["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
      throw new Error("Unsupported image format");
    }

    const filename = `${filenameBase}.${ext}`;
    const filePath = path.join(folder, filename);

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    
    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", (err) => reject(err));
      response.data.on("error", (err) => reject(err));
    });

    const resizeImageIfNeeded = async (filePath) => {
      const image = sharp(filePath);
      const metadata = await image.metadata();

      if (metadata.width > 100 || metadata.height > 100) {
        await image
          .resize(100, 100, {
            fit: sharp.fit.inside,
            withoutEnlargement: true,
          })
          .toFile(filePath);
      }
    };

    await resizeImageIfNeeded(filePath);
    return filename;
  } catch{
    console.log('Image not available')
  }
};
