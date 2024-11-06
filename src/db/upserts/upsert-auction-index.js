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
    const auctionHouses = data.auctions;

    const auctionsHousesToProcess = [];
    auctionHouses.forEach(auctionHouse => {
        const entry = {
            name: auctionHouse.name,
            houseId: auctionHouse.id,
            realmId: realmId,
            region: region,
            unique: `${auctionHouse.name}-${realmId}-${region}`
        }

        auctionsHousesToProcess.push(entry);
    });

    return auctionsHousesToProcess;
}

async function upsertAuctionHouseIndexData(auctionHousesToProcess){
    const client = await pool.connect();
    try {
        for (const auctionHouse of auctionHousesToProcess) {
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
            const values = [auctionHouse.name, auctionHouse.houseId, auctionHouse.realmId, auctionHouse.region, auctionHouse.unique];
            await client.query(query, values);
            console.log(`Upserted row for ${auctionHouse.name} in realm ${auctionHouse.realmId}`);
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