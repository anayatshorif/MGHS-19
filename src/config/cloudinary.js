require("dotenv").config();
const { v2: cloudinary } = require("cloudinary");

const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || "").trim();
const apiKey = (process.env.CLOUDINARY_API_KEY || "").trim();
const apiSecret = (process.env.CLOUDINARY_API_SECRET || "").trim();

if (!cloudName || !apiKey || !apiSecret) {
  console.warn(
    "Cloudinary is not fully configured. Upload features will not work until CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set."
  );
} else {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  });
}

module.exports = cloudinary;
