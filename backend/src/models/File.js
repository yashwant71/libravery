// backend/src/models/File.js
const mongoose = require("mongoose");

// --- NEW: A sub-schema for tracking actions with timestamps ---
const actionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
); // _id: false prevents MongoDB from creating a separate ID for each action entry

const fileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String },
  description: { type: String, trim: true },
  mimetype: { type: String },
  size: { type: Number },
  url: { type: String, required: true },
  public_id: { type: String, required: true },
  library: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library",
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  likes: [actionSchema],
  dislikes: [actionSchema],
  views: [actionSchema],
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
});

module.exports = mongoose.model("File", fileSchema);
