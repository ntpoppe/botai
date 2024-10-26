const fs = require('fs').promises;
const fetch = require('node-fetch');
const config = require('../config.json'); // Adjust the path as needed

class BlizzardAPI {
    constructor(clientId, clientSecret, region = 'us') {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.region = region;
        this.accessToken = null;
        this.tokenExpiry = null;
    }

    async getAccessToken() {
        if (this.accessToken && this.tokenExpiry > Date.now()) {
            return this.accessToken;
        }

        const authUrl = 'https://oauth.battle.net/token';
        const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

        const response = await fetch(authUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${credentials}`
            },
            body: 'grant_type=client_credentials'
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch access token: ${response.statusText}`);
        }

        const data = await response.json();
        this.accessToken = data.access_token;
        this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;
        return this.accessToken;
    }

    /**
     * Generic method to fetch data from a specified endpoint
     * @param {string} endpoint - The API endpoint path
     * @param {object} params - Query parameters as key-value pairs
     */
    async fetchData(endpoint, params = {}) {
        const token = await this.getAccessToken();
        const url = new URL(`https://${this.region}.api.blizzard.com/${endpoint}`);

        // Append query parameters
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

        const response = await fetch(url.toString(), {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error fetching data from ${endpoint}: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Saves JSON data to a specified file path
     * @param {string} filePath - Relative or absolute path to save the JSON data
     * @param {object} data - JSON data to save
     */
    async saveJSON(filePath, data) {
        try {
            await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
            console.log(`Data saved to ${filePath}`);
        } catch (err) {
            console.error(`Error writing JSON file: ${err}`);
        }
    }

    /**
     * Reads JSON data from a specified file path
     * @param {string} filePath - Relative or absolute path to read the JSON data
     */
    async readJSON(filePath) {
        try {
            const data = await fs.readFile(filePath, 'utf8');
            return JSON.parse(data);
        } catch (err) {
            console.error(`Error reading JSON file: ${err}`);
            throw err;
        }
    }
}

module.exports = BlizzardAPI;
