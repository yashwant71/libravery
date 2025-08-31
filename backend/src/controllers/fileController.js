// backend/src/controllers/fileController.js
const cloudinary = require("../config/cloudinary");
const File = require("../models/File");
const Library = require("../models/Library"); // Needed to find library by name
// --- NEW: Define allowed file types for backend validation ---
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png"];

// --- MODIFIED: The uploadFile function ---
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    if (!req.body.libraryId) {
      return res.status(400).json({ message: "Library ID is required" });
    }

    // --- 1. Backend File Type Validation ---
    if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
      return res.status(400).json({
        message: "Invalid file type. Only JPG, JPEG, and PNG are allowed.",
      });
    }

    const library = await Library.findById(req.body.libraryId);
    if (!library) {
      return res.status(404).json({ message: "Associated library not found" });
    }

    // --- 2. Cloudinary Image Optimization & Transformation ---
    // We convert the buffer to a base64 string for Cloudinary to process.
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: `library-app/${library.name.toLowerCase().replace(/\s/g, "-")}`,
      // Transformations to optimize the image:
      transformation: [
        { width: 1920, crop: "limit" }, // Resize to max 1920px width, preserving aspect ratio
        { quality: "auto" }, // Automatically adjust quality to balance file size and visuals
      ],
      resource_type: "auto",
    });

    const newFile = new File({
      filename: req.file.originalname,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: result.bytes, // Use the optimized size from Cloudinary's response
      url: result.secure_url,
      public_id: result.public_id,
      library: req.body.libraryId,
    });

    await newFile.save();
    res
      .status(201)
      .json({ message: "File uploaded successfully", file: newFile });
  } catch (error) {
    console.error("Upload error:", error);
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
    const files = await File.find({ library: foundLibrary._id }).sort({
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
