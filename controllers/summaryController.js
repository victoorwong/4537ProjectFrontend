const Summary = require("../models/Summary");
const User = require("../models/User");
const { generateSummary } = require("../utils/modelLoader");

exports.generateGameSummary = async (req, res) => {
    try {
        const { homeTeam, awayTeam, homeScore, awayScore, date, highlights } = req.body;

        // Check if all required fields are provided
        if (!homeTeam || !awayTeam || homeScore === undefined || awayScore === undefined || !date) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required game details'
            });
        }

        // Get user and increment API call count
        const user = await User.findById(req.user.userId);
        user.apiCallsRemaining -= 1;
        await user.save();

        // Create a prompt for text generation
        const prompt = `Tell me the score and date for a hockey game based on the following information:
Game: ${homeTeam} vs ${awayTeam}
Final Score: ${homeTeam} ${homeScore}, ${awayTeam} ${awayScore}
Date: ${date}
${highlights ? `Highlights: ${highlights}` : ''}

Hockey Game Summary:`;

        const summaryText = await generateSummary(prompt);



        // Save summary to database
        const summary = await Summary.create({
            userId: req.user.userId,
            gameDetails: {
                homeTeam,
                awayTeam,
                homeScore,
                awayScore,
                date: new Date(date)
            },
            summary: summaryText
        });

        const response = {
            success: true,
            data: summary
        };

        if (req.apiLimitExceeded) {
            response.warning = `You have exceeded the free limit of 20 API calls.`;
        }

        res.status(201).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.getUserSummaries = async (req, res) => {
    try {
        const summaries = await Summary.find({ userId: req.user.userId });

        res.status(200).json({
            success: true,
            count: summaries.length,
            data: summaries
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};