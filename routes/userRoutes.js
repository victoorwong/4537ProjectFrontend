// user routes
const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const User = require("../models/User"); // Import User model

const router = express.Router();

// Get user profile (protected route)
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({
      userId: user._id,
      email: user.email,
      apiCallsRemaining: user.apiCallsRemaining,
      message: `Welcome User ID: ${req.user.userId}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;