// backend/src/routes/commentRoutes.js
const express = require("express");
const {
  getCommentsForFile,
  addCommentToFile,
} = require("../controllers/commentController");
const router = express.Router();

// Route structure: /api/comments/:fileId
router.route("/:fileId").get(getCommentsForFile).post(addCommentToFile);

module.exports = router;
