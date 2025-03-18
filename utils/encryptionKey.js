const axios = require('axios');

async function fetchHealthIdCert(accessToken) {
    if (!accessToken) {
        throw new Error('Access token is required to fetch health ID certificate');
    }

    try {
        const response = await axios.get('https://healthidsbx.abdm.gov.in/api/v1/auth/cert', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching certificate:', error.response ? error.response.data : error.message);
        throw error;
    }
}

module.exports = fetchHealthIdCert;