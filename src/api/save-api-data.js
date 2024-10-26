const path = require('path');
const extractKeys = require('../utils/extract-keys');

// Class to handle fetching and saving data from Blizzard API endpoints
class SaveApiData {
    /**
     * Initializes the SaveApiData instance
     * @param {BlizzardAPI} blizzardAPI - An instance of the BlizzardAPI class
     * @param {Array} endpoints - An array of endpoint objects to fetch data from
     */
    constructor(blizzardAPI, endpoints = []) {
        this.blizzardAPI = blizzardAPI;
        this.endpoints = endpoints;
    }

    /**
     * Adds a new endpoint to the list
     * @param {object} endpoint - The endpoint object to add
     */
    addEndpoint(endpoint) {
        this.endpoints.push(endpoint);
    }

    /**
     * Fetches data from all configured endpoints and saves them to their respective file paths
     */
    async fetchAndSaveAll() {
        for (const endpoint of this.endpoints) {
            try {
                console.log(`Fetching data for: ${endpoint.name}`);
                const data = await this.blizzardAPI.fetchData(endpoint.path, endpoint.params);
                await this.blizzardAPI.saveJSON(endpoint.savePath, data);
                console.log(`Data for ${endpoint.name} saved to ${endpoint.savePath}`);
            } catch (err) {
                console.error(`Error processing ${endpoint.name}: ${err.message}`);
            }
        }
    }

    /**
     * Processes the saved JSON data for a specific endpoint
     * @param {string} endpointName - The name of the endpoint to process
     * @param {Array} excludeKeys - Keys to exclude during extraction
     */
    async processSavedData(endpointName, excludeKeys = []) {
        const endpoint = this.endpoints.find(ep => ep.name === endpointName);
        if (!endpoint) {
            console.error(`Endpoint with name "${endpointName}" not found.`);
            return;
        }

        try {
            console.log(`Processing data for: ${endpoint.name}`);
            const jsonData = await this.blizzardAPI.readJSON(endpoint.savePath);
            const keysOnly = extractKeys(jsonData, excludeKeys);
            console.log(`Extracted Keys for ${endpoint.name}:\n`, keysOnly.join('\n'));
        } catch (err) {
            console.error(`Error processing JSON data for ${endpoint.name}: ${err.message}`);
        }
    }
}

module.exports = SaveApiData;
