const fs = require('fs').promises;
const fetch = require('node-fetch');

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
     * @param {string} endpointOrUrl - The API endpoint path
     * @param {object} params - Query parameters as key-value pairs
     */
    async fetchData(endpointOrUrl, params = {}, retries = 3, backoff = 2000, timeout = 10000) {
        const token = await this.getAccessToken();
        let url;

        if (endpointOrUrl.startsWith('http://') || endpointOrUrl.startsWith('https://')) {
            // If a full URL is provided, use it directly
            url = new URL(endpointOrUrl);
        } else {
            // Otherwise, build the URL using the endpoint path and parameters
            url = new URL(`https://${this.region}.api.blizzard.com/${endpointOrUrl}`);
            Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        }

        const temp = url.toString();

        const fetchWithTimeout = async (resource, options = {}) => {
            const controller = new AbortController();
            const { signal } = controller;
            options.signal = signal;
    
            // Timeout logic
            const timeoutId = setTimeout(() => controller.abort(), timeout);
    
            try {
                const response = await fetch(resource, options);
                clearTimeout(timeoutId);
                return response;
            } catch (error) {
                clearTimeout(timeoutId);
                throw error;
            }
        };

        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const response = await fetchWithTimeout(url.toString(), {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
    
                if (!response.ok) {
                    throw new Error(`Error fetching data from ${url}: ${response.statusText}`);
                }
    
                return await response.json();
            } catch (error) {
                if (error.name === 'AbortError') {
                    console.warn(`Request to ${url} timed out on attempt ${attempt}. Retrying...`);
                } else {
                    console.error(`Error fetching data from ${url} on attempt ${attempt}: ${error.message}`);
                }
    
                if (attempt < retries) {
                    // Wait and retry with exponential backoff
                    await new Promise(resolve => setTimeout(resolve, backoff));
                    backoff *= 2; // Double the backoff delay for the next attempt
                } else {
                    // Max retries reached, rethrow error
                    throw new Error(`Failed to fetch data from ${url} after ${retries} attempts: ${error.message}`);
                }
            }
        }
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
