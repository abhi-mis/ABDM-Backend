require("dotenv").config();

const axios = require('axios');
const fetchHealthIdCert = require("../utils/encryptionKey");
const encryptData = require("../utils/encryptData");
const { v4: uuidv4 } = require('uuid');

const fetchAccessToken = async () => {
    try {
        console.log('Fetching access token...');
        
        const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
        const clientSecret = process.env.NEXT_PUBLIC_CLIENT_SECRET;

        const response = await axios.post(
            'https://dev.abdm.gov.in/api/hiecm/gateway/v3/sessions',
            {
                clientId: clientId,
                clientSecret: clientSecret,
                grantType: 'client_credentials',
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'REQUEST-ID': uuidv4(),
                    'TIMESTAMP': new Date().toISOString(),
                    'X-CM-ID': 'sbx'
                },
                withCredentials: true,
            }
        );

        return response.data.accessToken;
    } catch (err) {
        console.error("Error fetching access token:", err.message);
        throw new Error("Failed to fetch access token");
    }
};

const sendOtp = async (req, res) => {
    try {
        console.log('Sending OTP...');
        const { aadhar } = req.body;

        if (!aadhar) {
            return res.status(400).json({ message: "Please provide aadhar" });
        }

        const accessToken = await fetchAccessToken(); // Fetch the access token dynamically

        const url = 'https://abhasbx.abdm.gov.in/abha/api/v3/enrollment/request/otp';
        const requestId = uuidv4();
        const timestamp = new Date().toISOString();

        const headers = {
            'Content-Type': 'application/json',
            'REQUEST-ID': requestId,
            'TIMESTAMP': timestamp,
            'Authorization': `Bearer ${accessToken}`
        };

        const publicKey = await fetchHealthIdCert(accessToken);
        const loginId = encryptData(aadhar, publicKey);

        const data = {
            "txnId": "",
            "scope": ["abha-enrol"],
            "loginHint": "aadhaar",
            "loginId": loginId,
            "otpSystem": "aadhaar"
        };

        console.log("OTP request data:", data);

        const response = await axios.post(url, data, { headers });
        res.status(200).json(response.data);
    } catch (err) {
        console.error("Error sending OTP:", err.message);
        res.status(500).json({ message: err.message });
    }
};

const verifyOtp = async (req, res) => {
    try {
        console.log('Verifying OTP...');
        const { txnId, otp, mobile } = req.body;

        if (!txnId || !otp || !mobile) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        const accessToken = await fetchAccessToken(); // Fetch the access token dynamically

        const url = 'https://abhasbx.abdm.gov.in/abha/api/v3/enrollment/enrol/byAadhaar';

        const headers = {
            'Content-Type': 'application/json',
            'TIMESTAMP': new Date().toISOString(),
            'REQUEST-ID': uuidv4(),
            'Authorization': `Bearer ${accessToken}`
        };

        const publicKey = await fetchHealthIdCert();
        const otp_value = encryptData(otp, publicKey);

        const data = {
            authData: {
                authMethods: ["otp"],
                otp: {
                    txnId,
                    otpValue: otp_value,
                    mobile
                }
            },
            consent: {
                code: "abha-enrollment",
                version: "1.4"
            }
        };

        console.log("OTP verification data:", data);

        const response = await axios.post(url, data, { headers });
        res.status(200).json(response.data);
    } catch (err) {
        console.error("Error verifying OTP:", err.message);
        res.status(500).json({ message: err.message });
    }
};

const getProfile = async (req, res) => {
    try {
        console.log('Fetching profile...');

        const { X_Token } = req.body;

        if (!X_Token) {
            return res.status(400).json({ message: "Please provide X_Token" });
        }

        const accessToken = await fetchAccessToken(); // Fetch the access token dynamically

        const url = 'https://abhasbx.abdm.gov.in/abha/api/v3/profile/account/abha-card';

        const headers = {
            'X-Token': `Bearer ${X_Token}`,
            'REQUEST-ID': uuidv4(),
            'TIMESTAMP': new Date().toISOString(),
            'Authorization': `Bearer ${accessToken}`
        };

        const response = await axios.get(url, {
            headers,
            responseType: 'arraybuffer'
        });

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', 'inline; filename="abha-card.png"');

        res.send(response.data);
    } catch (err) {
        console.error("Error fetching profile:", err.message);
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    sendOtp,
    verifyOtp,
    getProfile
};
