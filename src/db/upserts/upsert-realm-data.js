const { pool } = require('@db/pool.js');
const BlizzardAPI = require('@api/blizzard-api');
const ProcessEndpoints = require('@api/process-endpoints');
const generateEndpoint = require('@api/generate-endpoint');

async function convertRealmJson(region = 'us') {
    const blizzardAPI = new BlizzardAPI(process.env.WOW_CLIENT_ID, process.env.WOW_CLIENT_SECRET, region);
    const processEndpoints = new ProcessEndpoints(blizzardAPI);
    const endpointName = 'realmData';

    const endpointData = { 'namespace': `dynamic-classic-${region}` };
    const endpoint = generateEndpoint(endpointName, endpointData);
    const response = await processEndpoints.fetchEndpoint(endpoint);
    const data = response[endpointName].results;

    const realmsToProcess = []
    data.forEach(result => {
        const resultData = result.data;
        const realms = resultData.realms;
        realms.forEach(realm => {
            const entry = {
                name: realm.name.en_US,
                slug: realm.slug,
                regionId: realm.region.id,
                category: realm.category.en_US,
                timezone: realm.timezone,
                realmId: realm.id
            }

            realmsToProcess.push(entry);
        })
    });

    return realmsToProcess
 }

async function upsertRealmData(realmsToProcess) {
    const client = await pool.connect();
    try {
        for (const realm of realmsToProcess) {
            const query = `
                INSERT INTO realm_data (name, slug, region_id, category, timezone, realm_id)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (slug)
                DO UPDATE SET
                    name = EXCLUDED.name,
                    region_id = EXCLUDED.region_id,
                    category = EXCLUDED.category,
                    timezone = EXCLUDED.timezone,
                    realm_id = EXCLUDED.realm_id;
            `;
            const values = [realm.name, realm.slug, realm.regionId, realm.category, realm.timezone, realm.realmId];
            await client.query(query, values);
            console.log(`Upserted row for ${realm.slug}`);
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
        const realms = await convertRealmJson();
        await upsertRealmData(realms);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
})();