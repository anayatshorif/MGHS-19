const mongoose = require("mongoose");
const ensureSuperAdmin = require("../utils/ensureSuperAdmin");

module.exports = async function connectDB() {
  try {
    const mongoUri = (process.env.MONGO_URI || process.env.MONGODB_URI || "").trim();
    if (!mongoUri) {
      throw new Error("Missing MongoDB connection string. Set MONGO_URI (or MONGODB_URI) in environment variables.");
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000
    });
    console.log("MongoDB connected");
    await ensureSuperAdmin();
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};
