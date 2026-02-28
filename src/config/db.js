const mongoose = require("mongoose");
const ensureSuperAdmin = require("../utils/ensureSuperAdmin");

module.exports = async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
    await ensureSuperAdmin();
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};
