// user related logic
const User = require("../models/User");

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({
      email: user.email,
      isAdmin: user.isAdmin,
      apiCallsRemaining: user.apiCallsRemaining,
      message: `Welcome User ID: ${req.user.userId}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};