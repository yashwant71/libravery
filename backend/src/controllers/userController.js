// backend/src/controllers/userController.js
const User = require("../models/User");

// This single function handles both login and registration
exports.loginOrRegisterUser = async (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    return res
      .status(400)
      .json({ message: "Please provide a name and password" });
  }

  try {
    // Find user by name (case-insensitive)
    let user = await User.findOne({ name: name.toLowerCase() });

    if (user) {
      // --- User Exists: Handle as LOGIN ---
      const isMatch = await user.matchPassword(password);

      if (isMatch) {
        // Password matches, login successful
        res.status(200).json({
          _id: user._id,
          name: user.name,
          isAdmin: user.isAdmin,
          message: `Welcome back, ${user.name}!`,
        });
      } else {
        // Password does not match
        return res
          .status(401)
          .json({ message: "User already exists / Password does not match" });
      }
    } else {
      // --- User Does Not Exist: Handle as SIGNUP ---
      user = await User.create({
        name,
        password,
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        isAdmin: user.isAdmin,
        message: `User ${user.name} created successfully!`,
      });
    }
  } catch (error) {
    console.error("User auth error:", error);
    // Handle potential validation errors from Mongoose
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};
