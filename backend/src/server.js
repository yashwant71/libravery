// backend/src/server.js
const express = require("express");
const connectDB = require("./config/db"); // Your existing DB connection
const fileRoutes = require("./routes/fileRoutes");
const libraryRoutes = require("./routes/libraryRoutes"); // We'll create this soon
const cors = require("cors"); // To allow frontend to make requests

// Load environment variables from .env file (important: do this first!)
require("dotenv").config({ path: ".env" }); // Adjust path if .env is not in root of backend

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors()); // Enable CORS for all routes (adjust for production)
app.use(express.json()); // For parsing JSON request bodies
app.use(express.urlencoded({ extended: true })); // For parsing URL-encoded form data

// Routes
app.use("/api/files", fileRoutes);
app.use("/api/libraries", libraryRoutes);

// Simple root route (optional)
app.use(express.static("public"));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
// Error handling middleware (optional, but good practice)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// If it's not defined, we know we're running locally.
if (process.env.VITE_BACKEND_URL !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () =>
    console.log(`Server is running locally on port ${PORT}`)
  );
}

// Export the app object for Vercel's serverless environment
module.exports = app;
