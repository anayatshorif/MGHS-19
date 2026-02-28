const mongoose = require("mongoose");

const spotlightPhotoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    location: { type: String, trim: true, default: "MGHS Campus" },
    eventDate: { type: Date },
    imageUrl: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("SpotlightPhoto", spotlightPhotoSchema);
