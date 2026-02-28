require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");

(async () => {
  await connectDB();

  const superAdminEmail = process.env.SUPERADMIN_EMAIL || "superadmin@mghs19.com";
  const superAdminPassword = process.env.SUPERADMIN_PASSWORD || "superadmin12345";

  const superAdminExists = await User.findOne({ email: superAdminEmail });
  if (!superAdminExists) {
    const passwordHash = await bcrypt.hash(superAdminPassword, 10);
    await User.create({
      name: "MGHS Super Admin",
      email: superAdminEmail,
      phone: "0000000001",
      batchInfo: "MGHS-19",
      passwordHash,
      role: "superadmin",
      status: "approved"
    });
    console.log("Super Admin created:", superAdminEmail);
  } else {
    console.log("Super Admin already exists");
  }

  process.exit(0);
})();
