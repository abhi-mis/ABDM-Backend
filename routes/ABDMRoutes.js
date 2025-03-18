const express = require("express");
const router = express.Router();
const abdmController = require("../controllers/ABDMController");

// Access Token Route
router.get("/access-token", async (req, res) => {
    try {
        const accessToken = await abdmController.fetchAccessToken();
        res.json({ access_token: accessToken });
    } catch (error) {
        console.error("Access token error:", error);
        res.status(500).json({ 
            message: "Failed to fetch access token",
            error: error.message 
        });
    }
});

// OTP Routes
router.post("/send-otp", abdmController.sendOtp);
router.post("/verify-otp", abdmController.verifyOtp);

// Profile Route
router.post("/profile", abdmController.getProfile);

module.exports = router;