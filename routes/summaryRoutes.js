const express = require("express");
const { generateGameSummary, getUserSummaries } = require("../controllers/summaryController");
const { authMiddleware, trackApiUsage } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/generate", authMiddleware, trackApiUsage, generateGameSummary);
router.get("/", authMiddleware, getUserSummaries);

module.exports = router;