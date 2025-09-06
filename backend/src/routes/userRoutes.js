// backend/src/routes/userRoutes.js
const express = require("express");
const { loginOrRegisterUser } = require("../controllers/userController");
const router = express.Router();

router.post("/auth", loginOrRegisterUser);

module.exports = router;
