// backend/src/routes/libraryRoutes.js
const express = require("express");
const libraryController = require("../controllers/libraryController");
const router = express.Router();

router.post("/", libraryController.createLibrary);
router.get("/", libraryController.getLibraries);
router.get("/:id", libraryController.getLibraryById);
router.get("/by-name/:name", libraryController.getLibraryByName);
router.delete("/:id", libraryController.deleteLibrary);

module.exports = router;
