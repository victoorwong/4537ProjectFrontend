// user routes
const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Example: Get user profile (protected route)
router.get("/profile", authMiddleware, (req, res) => {
  res.json({ message: `Welcome User ID: ${req.user.userId}` });
});

module.exports = router;
