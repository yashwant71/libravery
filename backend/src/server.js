// Load environment variables from .env file (important: do this first!)
require("dotenv").config({ path: ".env" }); // Adjust path if .env is not in root of backend

const express = require("express");
const connectDB = require("./config/db");
const fileRoutes = require("./routes/fileRoutes");
const libraryRoutes = require("./routes/libraryRoutes");
const cors = require("cors");

const app = express();

connectDB();

app.use(cors()); // Enable CORS for all routes (adjust for production)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/files", fileRoutes);
app.use("/api/libraries", libraryRoutes);

app.use(express.static("public"));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Export the app object for Vercel's serverless environment
module.exports = app;

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server is running locally on port ${PORT}`)
);
