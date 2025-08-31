// backend/src/routes/fileRoutes.js
const express = require("express");
const multer = require("multer");
const fileController = require("../controllers/fileController");
const router = express.Router();

// Configure Multer for in-memory storage (Cloudinary needs a buffer)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/upload", upload.single("file"), fileController.uploadFile);
router.get("/", fileController.getFilesByLibrary);
router.delete("/:id", fileController.deleteFile);

module.exports = router;
