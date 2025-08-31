// backend/src/controllers/libraryController.js
const Library = require("../models/Library");
const File = require("../models/File");
const cloudinary = require("../config/cloudinary");

// Create a new library
exports.createLibrary = async (req, res) => {
  try {
    // V-- Destructure isPublic from the request body
    const { name, description, isPublic } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Library name is required" });
    }
    // V-- Pass isPublic to the new Library object
    const newLibrary = new Library({ name, description, isPublic });
    await newLibrary.save();
    res.status(201).json(newLibrary);
  } catch (error) {
    console.error("Error creating library:", error);
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "A library with this name already exists." });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --- MODIFIED: Get libraries based on admin status ---
exports.getLibraries = async (req, res) => {
  try {
    const { isAdmin } = req.query; // Check for 'isAdmin' query param
    // If isAdmin is true, the filter is empty ({}), getting all libraries.
    // Otherwise, it filters for public libraries only.
    const filter = isAdmin === "true" ? {} : { isPublic: true };

    const libraries = await Library.find(filter).sort({ name: 1 });
    res.json(libraries);
  } catch (error) {
    console.error("Error fetching libraries:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --- NEW: Delete a library and all its associated files ---
exports.deleteLibrary = async (req, res) => {
  try {
    const { id } = req.params;
    const library = await Library.findById(id);

    if (!library) {
      return res.status(404).json({ message: "Library not found" });
    }

    // 1. Find all files associated with this library
    const files = await File.find({ library: id });

    // 2. If there are files, delete them from Cloudinary
    if (files.length > 0) {
      // Get an array of just the public_ids for Cloudinary
      const publicIds = files.map((file) => file.public_id);
      // Use Cloudinary's bulk deletion API for efficiency
      await cloudinary.api.delete_resources(publicIds);
    }

    // 3. Delete all file records from MongoDB for this library
    await File.deleteMany({ library: id });

    // 4. Finally, delete the library itself
    await Library.findByIdAndDelete(id);

    res
      .status(200)
      .json({ message: "Library and all its files deleted successfully" });
  } catch (error) {
    console.error("Error deleting library:", error);
    res
      .status(500)
      .json({ message: "Server error during deletion", error: error.message });
  }
};

// Get a single library by ID
exports.getLibraryById = async (req, res) => {
  try {
    const library = await Library.findById(req.params.id);
    if (!library) {
      return res.status(404).json({ message: "Library not found" });
    }
    res.json(library);
  } catch (error) {
    console.error("Error fetching library by ID:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// NEW FUNCTION: Get a single library by name (public or private)
exports.getLibraryByName = async (req, res) => {
  try {
    const { name } = req.params;
    // Use a case-insensitive regex to find the library
    const library = await Library.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (!library) {
      return res.status(404).json({ message: "Library not found" });
    }
    res.json(library);
  } catch (error) {
    console.error("Error fetching library by name:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
