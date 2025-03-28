const Summary = require("../models/Summary");
const User = require("../models/User");
const axios = require("axios");


async function generateSummary(prompt) {
    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4",
                messages: [{ role: "user", content: prompt }]
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
                }
            }
        );

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("Error generating summary:", error);
        throw new Error("Failed to generate summary");
    }
}

exports.generateGameSummary = async (req, res) => {
    try {
        const { homeTeam, awayTeam, homeScore, awayScore, date, highlights } = req.body;

        if (!homeTeam || !awayTeam || homeScore === undefined || awayScore === undefined || !date) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required game details'
            });
        }

        const user = await User.findById(req.user.userId);
        user.apiCallsRemaining -= 1;
        await user.save();

        const prompt = `Tell me the score and date for a hockey game based on the following information:
Game: ${homeTeam} vs ${awayTeam}
Final Score: ${homeTeam} ${homeScore}, ${awayTeam} ${awayScore}
Date: ${date}
${highlights ? `Highlights: ${highlights}` : ''}

Hockey Game Summary:`;

        const summaryText = await generateSummary(prompt);

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
