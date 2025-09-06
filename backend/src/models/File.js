// backend/src/models/File.js
const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  filename: { type: String, required: true }, // Name from Cloudinary
  originalName: { type: String }, // Original name from user's computer
  mimetype: { type: String },
  size: { type: Number }, // Size in bytes
  url: { type: String, required: true }, // Cloudinary URL
  public_id: { type: String, required: true }, // Cloudinary public ID for deletion
  library: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library", // Reference to the Library model
    required: true,
  },
  // --- MODIFIED: Store the User's ObjectId instead of their name ---
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // This creates a reference to the User model
    required: true,
  },
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("File", fileSchema);
