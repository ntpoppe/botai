const { pool } = require('@db/pool.js');
const BlizzardAPI = require('@api/blizzard-api');
const ProcessEndpoints = require('@api/process-endpoints');
const generateEndpoint = require('@api/generate-endpoint');

async function convertAuctionListingsJson(){
    const blizzardAPI = new BlizzardAPI(process.env.WOW_CLIENT_ID, process.env.WOW_CLIENT_SECRET, region);
    const processEndpoints = new ProcessEndpoints(blizzardAPI);
    const endpointName = 'auctionListings';

    const endpointData = { 'namespace': `dynamic-classic-${region}` };
    const endpoint = generateEndpoint(endpointName, endpointData);
    const response = await processEndpoints.fetchEndpoint(endpoint);
    const data = response[endpointName].results;
}

async function upsertAuctionListingData(auctionListings){

}


(async () => {
    try {
        const auctionListings = await convertAuctionListingsJson();
        await upsertAuctionListingData(auctionListings);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
})();