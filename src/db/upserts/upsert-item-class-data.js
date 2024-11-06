const { pool } = require('@db/pool.js');
const BlizzardAPI = require('@api/blizzard-api');
const ProcessEndpoints = require('@api/process-endpoints');
const generateEndpoint = require('@api/generate-endpoint');

async function convertItemClassIndexJson(region = 'us') {
    const blizzardAPI = new BlizzardAPI(process.env.WOW_CLIENT_ID, process.env.WOW_CLIENT_SECRET, region);
    const processEndpoints = new ProcessEndpoints(blizzardAPI);
    const endpointParams = { 'namespace': `static-classic-${region}` };
    const allItems = [];
    let startingItemId = 1;

    try {
        do {
            const searchEndpointName = 'itemSearch';
            const searchEndpointParams = {
                ...endpointParams,
                'orderby': 'id',
                'id': `[${startingItemId},]`, 
                '_pageSize': 1000,
                '_page': 1 
            };
            const searchEndpoint = generateEndpoint(searchEndpointName, searchEndpointParams);
            const searchResponse = await processEndpoints.fetchEndpoint(searchEndpoint);

            if (
                searchResponse[searchEndpointName] &&
                searchResponse[searchEndpointName].results &&
                searchResponse[searchEndpointName].results.length > 0
            ) {
                const items = searchResponse[searchEndpointName].results;
                allItems.push(...items);

                console.log(`Fetched ${items.length} items starting from ID ${startingItemId}`);

                const firstItem = items[items.length - 1];
                startingItemId = firstItem.data.id + 1;
            } else {
                console.log(`No more items found after ID ${startingItemId - 1}`);
                break;
            }

            await delay(50);
        } while (true);

        console.log(`Total items fetched: ${allItems.length}`);
    } catch (error) {
        console.error(`Error fetching items:`, error);
    }

    const itemsToProcess = [];
    for (const item of allItems) {
        const entry = {
            id: item.data.id,
            itemClassId: item.data.item_class.id,
            itemSubClassId: item.data.item_subclass.id,
            media: item.data.media.id,
            name: item.data.name?.en_US || "Unknown",
            level: item.data.level,
            required_level: item.data.required_level,
            quality_type: item.data.quality.type,
            href: item.key.href,
        };

        itemsToProcess.push(entry);
    }

    return itemsToProcess;
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function upsertItemData(itemsToProcess){
    const client = await pool.connect();
    try {
        for (const item of itemsToProcess) {
            const query = `
                INSERT INTO item_data (id, item_class_id, item_subclass_id, media, name, level, required_level, quality_type, href)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                ON CONFLICT (href)
                DO UPDATE SET
                    href = EXCLUDED.href,
                    item_class_id = EXCLUDED.item_class_id,
                    item_subclass_id = EXCLUDED.item_subclass_id,
                    media = EXCLUDED.media,
                    name = EXCLUDED.name,
                    level = EXCLUDED.level,
                    required_level = EXCLUDED.required_level,
                    quality_type = EXCLUDED.quality_type;
            `;
            const values = [item.id, item.itemClassId, item.itemSubClassId, item.media, item.name, item.level, item.required_level, item.quality_type, item.href];
            await client.query(query, values);
            console.log(`Upserted row for ${item.name}`);
        }
    } catch (error) {
        console.error('Error upserting item data:', error.stack);
        throw error;
    } finally {
        client.release();
    }
}

(async () => {
    try {
        const itemsToProcess = await convertItemClassIndexJson();
        await upsertItemData(itemsToProcess);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
})();