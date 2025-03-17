const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const summaryRoutes = require("./routes/summaryRoutes");

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Define allowed origins (Frontend URLs)
const allowedOrigins = [
    "http://127.0.0.1:5500", // Local frontend (for development)
    "https://comp4537api.ziqil.com", // Hosted frontend (your production URL)
    "http://localhost:8003", // Another local frontend (if applicable)
];

// CORS configuration
app.use(
    cors({
        origin: (origin, callback) => {
            if (allowedOrigins.includes(origin) || !origin) {
                callback(null, true); // Allow the origin
            } else {
                callback(new Error("Not allowed by CORS")); // Reject the origin
            }
        },
        credentials: true, // Allow cookies and credentials to be sent
        methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow these methods for cross-origin requests
        allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers in the request
    })
);

// Handling preflight requests (OPTIONS)
app.options("*", cors());

// Static files
app.use("/", express.static("public"));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/summary", summaryRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
