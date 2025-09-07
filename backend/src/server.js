// Load environment variables from .env file (important: do this first!)
require("dotenv").config({ path: ".env" }); // Adjust path if .env is not in root of backend

const express = require("express");
const path = require("path");
const connectDB = require("./config/db");
const fileRoutes = require("./routes/fileRoutes");
const libraryRoutes = require("./routes/libraryRoutes");
const userRoutes = require("./routes/userRoutes");
const commentRoutes = require("./routes/commentRoutes");

const cors = require("cors");

const app = express();

connectDB();

app.use(cors()); // Enable CORS for all routes (adjust for production)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/files", fileRoutes);
app.use("/api/libraries", libraryRoutes);
app.use("/api/users", userRoutes); // <-- Wire up the user routes
app.use("/api/comments", commentRoutes);

app.use(express.static("public"));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server is running locally on port ${PORT}`)
);
