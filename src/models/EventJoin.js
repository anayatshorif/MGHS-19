const mongoose = require("mongoose");

const eventJoinSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    member: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    paymentStatus: { type: String, enum: ["unpaid", "paid"], default: "unpaid" }
  },
  { timestamps: true }
);

eventJoinSchema.index({ event: 1, member: 1 }, { unique: true });

module.exports = mongoose.model("EventJoin", eventJoinSchema);
