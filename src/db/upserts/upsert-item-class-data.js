const { pool } = require('@db/pool.js');
const BlizzardAPI = require('@api/blizzard-api');
const ProcessEndpoints = require('@api/process-endpoints');
const generateEndpoint = require('@api/generate-endpoint');

async function convertItemClassIndexJson(region = 'us') {
    const blizzardAPI = new BlizzardAPI(process.env.WOW_CLIENT_ID, process.env.WOW_CLIENT_SECRET, region);
    const processEndpoints = new ProcessEndpoints(blizzardAPI);
    const endpointName = 'itemClassIndex';

    const endpointParams = { 'namespace': `static-classic-${region}`};
    const endpoint = generateEndpoint(endpointName, endpointParams);
    const response = await processEndpoints.fetchEndpoint(endpoint);
    const data = response[endpointName].item_classes;
    
    const allItems = [];

    for (const itemClassRef of data) {
        const itemClassId = itemClassRef.id;
        console.log(`Collecting from class ID ${itemClassId}`);

        try {
            const itemClassEndpointName = 'itemClass';
            const itemClassEndpointParams = { ...endpointParams, itemClassId: itemClassId }; 
            const itemClassEndpoint = generateEndpoint(itemClassEndpointName, itemClassEndpointParams);
            const itemClassResponse = await processEndpoints.fetchEndpoint(itemClassEndpoint);
            
            const itemSubclasses = itemClassResponse[itemClassEndpointName].item_subclasses || [];

            for (const subclass of itemSubclasses) {
                const subclassId = subclass.id;

                let page = 1;
                let totalPages = 1;

                do {
                    const searchEndpointName = 'itemSearch';
                    const searchEndpointParams = {
                        ...endpointParams,
                        'q': '',
                        'item_class.id': itemClassId,
                        'item_subclass.id': subclassId,
                        'pageSize': 100,
                        'page': page
                    };
                    const searchEndpoint = generateEndpoint(searchEndpointName, searchEndpointParams);
                    const searchResponse = await processEndpoints.fetchEndpoint(searchEndpoint);

                    if (searchResponse[searchEndpointName].results && searchResponse[searchEndpointName].results.length > 0) {
                        const items = searchResponse[searchEndpointName].results;

                        allItems.push(...items);

                        const pageInfo = searchResponse[searchEndpointName].page;
                        totalPages = pageInfo.totalPages;
                        page++;
                    } else {
                        break;
                    }

                } while (page <= totalPages);

                console.log(`Total items for subclass ID ${subclassId}:`, allItems.length);
                delay(50)
            }
        } catch (err) {
            console.error(`Error fetching details for item class ID ${itemClassId}:`, error);
        }
       
    }

    const itemsToProcess = [];
    for (const item of allItems) {
        const entry = {
            id: item.data.id,
            itemClassId: item.data.item_class.id,
            itemSubClassId: item.data.item_subclass.id,
            media: item.data.media.id,
            name: item.data.name.en_US,
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
        console.error('Error upserting region data:', error.stack);
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