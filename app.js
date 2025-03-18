require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const ABDMRoutes = require("./routes/ABDMRoutes");

const app = express();
const port = process.env.PORT || 5000;

const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173", // Vite default port
    process.env.FRONTEND_URL // Add your production frontend URL in .env
].filter(Boolean); // Remove undefined values

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};

// Security Middleware
app.use(helmet());
app.use(cors(corsOptions));

// Body Parsing Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Handle preflight requests
app.options("*", cors(corsOptions));

// Health Check Route
app.get("/", (req, res) => {
    res.json({ 
        status: "healthy",
        message: "ABDM API Server is running"
    });
});

// API Routes
app.use("/api", ABDMRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ 
        status: "error",
        message: "Route not found" 
    });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("Error:", err);
    
    // Handle CORS errors
    if (err.message === "Not allowed by CORS") {
        return res.status(403).json({
            status: "error",
            message: "Origin not allowed"
        });
    }

    // Handle other errors
    res.status(err.status || 500).json({
        status: "error",
        message: err.message || "Something went wrong!",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    });
});

// Start Server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

module.exports = app;