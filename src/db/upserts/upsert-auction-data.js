const { pool } = require('@db/pool.js');
const BlizzardAPI = require('@api/blizzard-api');
const ProcessEndpoints = require('@api/process-endpoints');
const generateEndpoint = require('@api/generate-endpoint');

async function convertAuctionListingsJson(realmId, auctionHouseId = 6, region = 'us'){
    const blizzardAPI = new BlizzardAPI(process.env.WOW_CLIENT_ID, process.env.WOW_CLIENT_SECRET, region);
    const processEndpoints = new ProcessEndpoints(blizzardAPI);
    const endpointName = 'auctionHouseListings';

    const endpointData = { 'namespace': `dynamic-classic-${region}`, 'realmId': realmId, 'auctionHouseId': auctionHouseId };
    const endpoint = generateEndpoint(endpointName, endpointData);
    const response = await processEndpoints.fetchEndpoint(endpoint);
    const data = response[endpointName];
    const auctions = data.auctions;

    const auctionsToProcess = [];
    auctions.forEach(auction => {
        const entry = {
            auctionId: auction.id,
            itemId: auction.item.id,
            bid: auction.bid,
            buyout: auction.buyout,
            quantity: auction.quantity,
            timeLeft: auction.time_left,
            auctionHouseId: auctionHouseId,
            realmId: realmId,
            region: region,
            unique: `${auction.id}-${auctionHouseId}-${realmId}-${region}`
        }

        auctionsToProcess.push(entry);
    });

    return auctionsToProcess;
}

async function upsertAuctionListingData(auctionListings){
    const client = await pool.connect();
    try {
        for (const auction of auctionListings) {
            const query = `
            INSERT INTO auction_listings_data (auction_id, item_id, bid, buyout, quantity, time_left, auction_house_id, realm_id, region, unique_string)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (unique_string)
            DO UPDATE SET
                bid = EXCLUDED.bid,
                buyout = EXCLUDED.buyout,
                quantity = EXCLUDED.quantity,
                time_left = EXCLUDED.time_left,
                auction_house_id = EXCLUDED.auction_house_id,
                realm_id = EXCLUDED.realm_id,
                region = EXCLUDED.region;
            `;

            const values = [
                auction.auctionId,
                auction.itemId,
                auction.bid,
                auction.buyout,
                auction.quantity,
                auction.timeLeft,
                auction.auctionHouseId,
                auction.realmId,
                auction.region,
                auction.unique
            ];       

            await client.query(query, values);
            console.log(`Upserted row for ${auction.auctionId} in realm ${auction.realmId}`);
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
        const auctionListings = await convertAuctionListingsJson(4384);
        await upsertAuctionListingData(auctionListings);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
})();