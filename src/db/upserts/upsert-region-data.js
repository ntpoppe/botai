const { pool } = require('@db/pool.js');
const BlizzardAPI = require('@api/blizzard-api');
const ProcessEndpoints = require('@api/process-endpoints');
const generateEndpoint = require('@api/generate-endpoint');

async function convertRegionIndexJson(region = 'us'){
    const blizzardAPI = new BlizzardAPI(process.env.WOW_CLIENT_ID, process.env.WOW_CLIENT_SECRET, region);
    const processEndpoints = new ProcessEndpoints(blizzardAPI);
    const endpointName = 'regionIndex';

    const endpointData = { 'namespace': `dynamic-classic-${region}`};
    const endpoint = generateEndpoint(endpointName, endpointData);
    const response = await processEndpoints.fetchEndpoint(endpoint);
    const data = response[endpointName].regions;

    const regionsToProcess = [];
    for (const region of data) {
        const regionResponse = await processEndpoints.fetchUrl(region.href);
        const data = regionResponse['data'];
        if (data) {
            const entry = {
                regionId: data.id,
                name: data.name.en_US.toLowerCase(),
                tag: data.tag.toLowerCase(),
                patchString: data.patch_string.toLowerCase()
            };

            regionsToProcess.push(entry);
        }
    }

    return regionsToProcess;
}

async function upsertRegionData(regionsToProcess){
    const client = await pool.connect();
    try {
        for (const region of regionsToProcess) {
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
            const values = [region.regionId, region.name, region.tag, region.patchString];
            await client.query(query, values);
            console.log(`Upserted row for ${region.name}`);
        }
    } catch (error) {
        console.error('Error upserting region data:', error.stack);
        throw error;
    } finally {
        client.release();
    }
}

(async () => {
    try {
        const realmIndex = await convertRegionIndexJson();
        await upsertRegionData(realmIndex);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
})();