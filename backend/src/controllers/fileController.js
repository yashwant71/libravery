// backend/src/controllers/fileController.js
const cloudinary = require("../config/cloudinary");
const File = require("../models/File");
const Library = require("../models/Library"); // Needed to find library by name
// --- NEW: Define allowed file types for backend validation ---
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png"];

exports.uploadFile = async (req, res) => {
  try {
    const { libraryId, userId } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    if (!libraryId) {
      return res.status(400).json({ message: "Library ID is required" });
    }
    if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
      return res.status(400).json({
        message: "Invalid file type. Only JPG, JPEG, and PNG are allowed.",
      });
    }

    const library = await Library.findById(libraryId);
    if (!library) {
      return res.status(404).json({ message: "Associated library not found" });
    }

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: `library-app/${library.name.toLowerCase().replace(/\s/g, "-")}`,
      transformation: [{ width: 1920, crop: "limit" }, { quality: "auto" }],
      resource_type: "auto",
    });

    // --- THE FIX IS HERE ---
    // We now use `req.file.originalname` for the required 'filename' field.
    // This is the actual name of the file from the user's computer.
    const newFile = new File({
      filename: req.file.originalname,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: result.bytes,
      url: result.secure_url,
      public_id: result.public_id,
      library: libraryId,
      uploadedBy: userId,
    });

    await newFile.save();
    res
      .status(201)
      .json({ message: "File uploaded successfully", file: newFile });
  } catch (error) {
    // Log the full error for better debugging on the server
    console.error("Upload failed with error:", error);
    res
      .status(500)
      .json({ message: "Server error during upload", error: error.message });
  }
};
// Get files for a specific library
exports.getFilesByLibrary = async (req, res) => {
  try {
    const { libraryName } = req.query; // Get library name from query parameter
    if (!libraryName) {
      return res.status(400).json({ message: "Library name is required" });
    }

    // Find the library by name
    const foundLibrary = await Library.findOne({
      name: { $regex: new RegExp(`^${libraryName}$`, "i") },
    }); // Case-insensitive match
    if (!foundLibrary) {
      return res
        .status(404)
        .json({ message: `Library '${libraryName}' not found` });
    }

    // Find files associated with that library's ID
    const files = await File.find({ library: foundLibrary._id })
      .populate("uploadedBy", "name") // <-- THE MAGIC IS HERE
      .sort({
        uploadedAt: -1,
      });
    res.json(files);
  } catch (error) {
    console.error("Error fetching files by library:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a file (from Cloudinary and DB)
exports.deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(file.public_id);

    // Delete from MongoDB
    await file.deleteOne(); // Use deleteOne() or deleteMany() instead of remove()

    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    res
      .status(500)
      .json({ message: "Server error during deletion", error: error.message });
  }
};

exports.likeFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { userId, action } = req.body; // action can be 'like' or 'dislike'

    if (!userId || !action) {
      return res
        .status(400)
        .json({ message: "User ID and action are required." });
    }

    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ message: "File not found." });
    }

    const likes = file.likes.map((id) => id.toString());
    const dislikes = file.dislikes.map((id) => id.toString());

    const hasLiked = likes.includes(userId);
    const hasDisliked = dislikes.includes(userId);

    if (action === "like") {
      // If user has already liked, remove the like (toggle off)
      if (hasLiked) {
        file.likes.pull(userId);
      } else {
        // If not liked, add the like
        file.likes.push(userId);
        // If they had previously disliked it, remove the dislike
        if (hasDisliked) {
          file.dislikes.pull(userId);
        }
      }
    } else if (action === "dislike") {
      // If user has already disliked, remove the dislike (toggle off)
      if (hasDisliked) {
        file.dislikes.pull(userId);
      } else {
        // If not disliked, add the dislike
        file.dislikes.push(userId);
        // If they had previously liked it, remove the like
        if (hasLiked) {
          file.likes.pull(userId);
        }
      }
    } else {
      return res.status(400).json({ message: "Invalid action." });
    }

    await file.save();

    // Populate the user data to send back the full, updated file object
    const updatedFile = await File.findById(fileId).populate(
      "uploadedBy",
      "name"
    );
    res.status(200).json(updatedFile);
  } catch (error) {
    console.error("Error liking file:", error);
    res.status(500).json({ message: "Server error" });
  }
};
