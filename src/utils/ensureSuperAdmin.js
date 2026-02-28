const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function ensureSuperAdmin() {
  const superAdminEmail = (process.env.SUPERADMIN_EMAIL || "superadmin@mghs19.com").toLowerCase().trim();
  const superAdminPassword = process.env.SUPERADMIN_PASSWORD || "superadmin12345";

  if (!superAdminEmail || !superAdminPassword) return;

  const exists = await User.findOne({ email: superAdminEmail });
  if (exists) return;

  const passwordHash = await bcrypt.hash(superAdminPassword, 10);
  await User.create({
    name: "MGHS Super Admin",
    email: superAdminEmail,
    phone: "0000000001",
    batchInfo: "MGHS-19",
    passwordHash,
    role: "superadmin",
    status: "approved",
    nickName: "SuperAdmin",
    shift: "day",
    college: "N/A",
    university: "N/A",
    permanentAddress: "N/A",
    currentAddress: "N/A",
    profession: "Administrator"
  });

  console.log(`Super Admin created: ${superAdminEmail}`);
}

module.exports = ensureSuperAdmin;
