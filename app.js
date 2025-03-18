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
    "https://your-frontend-domain.com"
];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

// Handle preflight requests
app.options("*", cors(corsOptions));

// Routes
app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.use("/api", ABDMRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
