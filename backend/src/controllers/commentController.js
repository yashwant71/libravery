// backend/src/controllers/commentController.js
const Comment = require("../models/Comment");
const File = require("../models/File");

// --- Get all comments for a specific file ---
exports.getCommentsForFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const comments = await Comment.find({ file: fileId })
      .populate("user", "name") // Populate the user's name
      .sort({ createdAt: "desc" }); // Show newest comments first

    res.status(200).json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// --- Add a new comment to a file ---
exports.addCommentToFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { userId, text } = req.body;

    if (!userId || !text) {
      return res
        .status(400)
        .json({ message: "User ID and comment text are required." });
    }

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: "File not found." });
    }

    const newComment = new Comment({
      file: fileId,
      user: userId,
      text,
    });

    await newComment.save();

    // Add the comment reference to the File document
    file.comments.push(newComment._id);
    await file.save();

    // Populate the user data before sending the new comment back
    const populatedComment = await Comment.findById(newComment._id).populate(
      "user",
      "name"
    );

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Server error" });
  }
};
