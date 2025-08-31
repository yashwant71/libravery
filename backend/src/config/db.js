// backend/src/config/db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      // These options are deprecated in newer Mongoose versions, but good for older versions
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      // useCreateIndex: true, // For unique indexes
      // useFindAndModify: false // For findOneAndUpdate, findOneAndDelete
    });
    console.log("MongoDB Connected...");
  } catch (err) {
    console.error(err.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
