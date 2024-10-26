const path = require('path');
const extractKeys = require('../utils/extract-keys');

// Class to handle fetching and saving data from Blizzard API endpoints
class PrcoessEndpoints {
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
     * Fetches data from all configured endpoints and saves them to their respective file paths.
     * @param {boolean} saveJSON - Saves data to JSON file, defaults to false.
     */
    async fetchAll(saveJSON = false) {
        for (const endpoint of this.endpoints) {
            try {
                console.log(`Fetching data for: ${endpoint.name}`);
                const data = await this.blizzardAPI.fetchData(endpoint.path, endpoint.params);

                if (saveJSON === true){
                    await this.blizzardAPI.saveJSON(endpoint.savePath, data);
                    console.log(`Data for ${endpoint.name} saved to ${endpoint.savePath}`);
                }

            } catch (err) {
                console.error(`Error processing ${endpoint.name}: ${err.message}`);
            }
        }
    }

    /**
     * Fetches data from a specific API endpoint and returns it in a structured format.
     * @param {Object} endpoint - The endpoint configuration object.
     * @param {boolean} saveJSON - Save to a JSON file, defaults to false.
     * @returns {Promise<Object>} A promise that resolves to an object containing the fetched data, keyed by the endpoint name.
     */
    async fetchEndpoint(endpoint, saveJSON = false) {
        console.log(`Fetching data for: ${endpoint.name}`);
        const data = await this.blizzardAPI.fetchData(endpoint.path, endpoint.params);

        if (saveJSON === true){
            await this.blizzardAPI.saveJSON(endpoint.savePath, data);
            console.log(`Data for ${endpoint.name} saved to ${endpoint.savePath}`);
        }

        return { [endpoint.name]: data}
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

module.exports = PrcoessEndpoints;
