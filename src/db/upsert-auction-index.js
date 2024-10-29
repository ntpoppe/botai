const { pool } = require('@db/pool.js');
const BlizzardAPI = require('@api/blizzard-api');
const ProcessEndpoints = require('@api/process-endpoints');
const generateEndpoint = require('@api/generate-endpoint');

let realmId = 4387;

async function convertAuctionHouseIndexJson(realmId, region = 'us'){
    const blizzardAPI = new BlizzardAPI(process.env.WOW_CLIENT_ID, process.env.WOW_CLIENT_SECRET, region);
    const processEndpoints = new ProcessEndpoints(blizzardAPI);
    const endpointName = 'auctionHouseIndex';

    const endpointData = { 'namespace': `dynamic-classic-${region}`, 'realmId': realmId };
    const endpoint = generateEndpoint(endpointName, endpointData);
    const response = await processEndpoints.fetchEndpoint(endpoint);
    const data = response[endpointName];
    const auctions = data.auctions;

    const auctionsToProcess = [];
    auctions.forEach(auction => {
        const entry = {
            name: auction.name,
            houseId: auction.id,
            realmId: realmId,
            region: region,
            unique: `${auction.name}-${realmId}-${region}`
        }

        auctionsToProcess.push(entry);
    });

    return auctionsToProcess;
}

async function upsertAuctionHouseIndexData(auctionsToProcess){
    const client = await pool.connect();
    try {
        for (const auction of auctionsToProcess) {
            const query = `
                INSERT INTO auction_house_data (name, house_id, realm_id, region, unique_string)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (unique_string)
                DO UPDATE SET
                    name = EXCLUDED.name,
                    house_id = EXCLUDED.house_id,
                    realm_id = EXCLUDED.realm_id,
                    region = EXCLUDED.region;
            `;
            const values = [auction.name, auction.houseId, auction.realmId, auction.region, auction.unique];
            await client.query(query, values);
            console.log(`Upserted row for ${auction.name} in realm ${auction.realmId}`);
        }
    } catch (error) {
        console.error('Error upserting realm data:', error.stack);
        throw error;
    } finally {
        client.release();
    }
}

(async () => {
    try {
        const auctionListings = await convertAuctionHouseIndexJson(realmId);
        await upsertAuctionHouseIndexData(auctionListings);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
})();