const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  apiCallsRemaining: { type: Number, default: 20 },
});

module.exports = mongoose.model("User", UserSchema);
