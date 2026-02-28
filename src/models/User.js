const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    nickName: { type: String, trim: true, default: "" },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    shift: { type: String, enum: ["day", "morning"], default: "day" },
    college: { type: String, trim: true, default: "" },
    university: { type: String, trim: true, default: "" },
    permanentAddress: { type: String, trim: true, default: "" },
    currentAddress: { type: String, trim: true, default: "" },
    profession: { type: String, trim: true, default: "" },
    batchInfo: { type: String, required: true, trim: true },
    profilePicture: { type: String, default: "https://cdn-icons-png.flaticon.com/512/3177/3177440.png" },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["member", "admin", "superadmin"], default: "member" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
