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
    const { libraryName, sort } = req.query; // Get the new 'sort' query parameter
    if (!libraryName) {
      return res.status(400).json({ message: "Library name is required" });
    }

    const foundLibrary = await Library.findOne({
      name: { $regex: new RegExp(`^${libraryName}$`, "i") },
    });
    if (!foundLibrary) {
      return res
        .status(404)
        .json({ message: `Library '${libraryName}' not found` });
    }

    let files;
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // A helper for aggregation-based sorting
    const getSortedFilesByAction = async (actionType, dateFilter) => {
      return File.aggregate([
        // Match files in the correct library
        { $match: { library: foundLibrary._id } },
        // Add a new field for the count of recent actions
        {
          $addFields: {
            recentActionCount: {
              $size: {
                $filter: {
                  input: `$${actionType}`, // e.g., '$likes' or '$views'
                  as: "action",
                  cond: dateFilter
                    ? { $gte: ["$$action.date", dateFilter] }
                    : true,
                },
              },
            },
          },
        },
        // Sort by the new field, then by total likes as a tie-breaker
        {
          $sort: { recentActionCount: -1, "likes.length": -1, uploadedAt: -1 },
        },
      ]);
    };

    switch (sort) {
      case "most-viewed-all-time":
        files = await File.aggregate([
          { $match: { library: foundLibrary._id } },
          { $addFields: { viewCount: { $size: "$views" } } },
          { $sort: { viewCount: -1, uploadedAt: -1 } },
        ]);
        break;
      case "most-viewed-this-month":
        files = await getSortedFilesByAction("views", oneMonthAgo);
        break;
      case "most-viewed-this-week":
        files = await getSortedFilesByAction("views", oneWeekAgo);
        break;
      case "most-liked-all-time":
        files = await File.aggregate([
          { $match: { library: foundLibrary._id } },
          { $addFields: { likeCount: { $size: "$likes" } } },
          { $sort: { likeCount: -1, uploadedAt: -1 } },
        ]);
        break;
      case "most-liked-this-month":
        files = await getSortedFilesByAction("likes", oneMonthAgo);
        break;
      case "most-liked-this-week":
        files = await getSortedFilesByAction("likes", oneWeekAgo);
        break;
      case "most-recent":
      default:
        files = await File.find({ library: foundLibrary._id }).sort({
          uploadedAt: -1,
        });
        break;
    }

    // After aggregation, we need to manually populate the uploader info
    const populatedFiles = await File.populate(files, {
      path: "uploadedBy",
      select: "name",
    });

    res.json(populatedFiles);
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
    const { userId, action } = req.body;

    if (!userId || !action) {
      return res
        .status(400)
        .json({ message: "User ID and action are required." });
    }

    // Find the file just once to check its state
    const file = await File.findById(fileId, "likes dislikes"); // Only select the fields we need
    if (!file) {
      return res.status(404).json({ message: "File not found." });
    }

    const hasLiked = file.likes.some(
      (item) => item.user && item.user.toString() === userId
    );
    const hasDisliked = file.dislikes.some(
      (item) => item.user && item.user.toString() === userId
    );

    let update = {};

    if (action === "like") {
      if (hasLiked) {
        // If already liked, remove the like
        update = { $pull: { likes: { user: userId } } };
      } else {
        // If not liked, add a like and remove any dislike
        update = {
          $push: { likes: { user: userId, date: new Date() } },
          $pull: { dislikes: { user: userId } },
        };
      }
    } else if (action === "dislike") {
      if (hasDisliked) {
        // If already disliked, remove the dislike
        update = { $pull: { dislikes: { user: userId } } };
      } else {
        // If not disliked, add a dislike and remove any like
        update = {
          $push: { dislikes: { user: userId, date: new Date() } },
          $pull: { likes: { user: userId } },
        };
      }
    } else {
      return res.status(400).json({ message: "Invalid action." });
    }

    // Atomically apply the update and return the newly updated document
    const updatedFile = await File.findByIdAndUpdate(fileId, update, {
      new: true,
    }).populate("uploadedBy", "name");

    res.status(200).json(updatedFile);
  } catch (error) {
    console.error("Error liking file:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.trackView = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    // Use findOneAndUpdate to atomically update the document in the database
    // This is much safer than findById -> save()
    await File.findOneAndUpdate(
      {
        _id: fileId,
        "views.user": { $ne: userId }, // Condition: update only if user has NOT already viewed
      },
      {
        $push: { views: { user: userId, date: new Date() } }, // Action: push a new view object
      }
    );

    res.status(200).json({ message: "View tracked successfully." });
  } catch (error) {
    console.error("Error tracking view:", error);
    res.status(500).json({ message: "Server error" });
  }
};
