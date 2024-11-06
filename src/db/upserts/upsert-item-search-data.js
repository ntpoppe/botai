const { pool } = require('@db/pool.js');
const BlizzardAPI = require('@api/blizzard-api');
const ProcessEndpoints = require('@api/process-endpoints');
const generateEndpoint = require('@api/generate-endpoint');

async function convertItemSearchJson(region = 'us') {
    const blizzardAPI = new BlizzardAPI(process.env.WOW_CLIENT_ID, process.env.WOW_CLIENT_SECRET, region);
    const processEndpoints = new ProcessEndpoints(blizzardAPI);
    
    const endpointName = 'itemSearch';
    const namespace = `static-${region}`;

    const endpointData = { namespace };
    const endpoint = generateEndpoint(endpointName, endpointData);

    const itemsToProcess = [];
    for (const item of fetchedItems) {
        const entry = {

        };

        itemsToProcess.push(entry);
    }

    return itemsToProcess;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function upsertItemSearchData(itemsToProcess){
    const client = await pool.connect();
    try {
        for (const item of itemsToProcess) {
            const query = `
                INSERT INTO region_data (region_id, name, tag, patch_string)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (region_id)
                DO UPDATE SET
                    region_id = EXCLUDED.region_id,
                    name = EXCLUDED.name,
                    tag = EXCLUDED.tag,
                    patch_string = EXCLUDED.patch_string;
            `;
            const values = [];
            await client.query(query, values);
            console.log(`Upserted row for `);
        }
    } catch (error) {
        console.error('Error upserting item search data:', error.stack);
        throw error;
    } finally {
        client.release();
    }
}

(async () => {
    try {
        const realmIndex = await convertItemSearchJson();
        await upsertItemSearchData(realmIndex);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
})();