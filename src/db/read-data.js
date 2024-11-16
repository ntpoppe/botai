const { pool } = require('@db/pool.js');

module.exports = {
    queries: {
        items: {
            getItem: `
                SELECT *
                FROM item_data
                WHERE name ILIKE $1
                LIMIT 1;
            `,
            getAllItemNames: `
                SELECT name
                FROM item_data
            `,
            getAutoCompleteItems: `
                SELECT name
                FROM item_data
                WHERE name ILIKE $1
                ORDER BY name ASC
                LIMIT 25;
            `,
        },
        auctionHouse: {
            getAuction: `
                SELECT *
                FROM auction_listings_data
                WHERE item_id = $1
                AND auction_house_id = $2
                AND realm_id = $3
            `,
        },
        realms: {
            getRealm: `
                SELECT *
                FROM realm_data
                WHERE slug = $1
                AND region_id = $2
                LIMIT 1
            `,
        },
        regions: {
            getRegion: `
                SELECT *
                FROM region_data
                WHERE tag = $1
                LIMIT 1
            `
        }
    },

    async executeQuery(queryCategory, queryName, params) {
        const client = await pool.connect();
        try {
            const query = this.queries[queryCategory][queryName];
            if (!query) {
                throw new Error(`Query not found: ${queryCategory}.${queryName}`);
            }
            const res = await client.query(query, params);
            return res.rows;
        } catch (err) {
            console.error(`Error executing query ${queryCategory}.${queryName}:`, err.stack);
            throw err;
        } finally {
            client.release();
        }
    },

    async readData(queryCategory, queryName, params) {
        try {
            const data = await this.executeQuery(queryCategory, queryName, params);
            return data;
        } catch (err) {
            console.error('Error fetching data:', err);
            throw err;
        }
    }
}