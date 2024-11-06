const { pool } = require('@db/pool.js');

module.exports = {
    queries: {
        auctionHouse: {
            getAuction: `
                SELECT *
                FROM auction_listings_data
                WHERE item_id = $1
                AND auction_house_id = $2
                AND realm_id = $3
                AND region = $4;
            `
        },
        realms: {
            getRealm: `
                SELECT *
                FROM realm_data
                WHERE slug = $1
                AND region_id = $2
            `
        },
        regions: {
            getRegion: `
                SELECT *
                FROM region_data
                WHERE tag = $1
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

    async getData(queryCategory, queryName, params) {
        try {
            const data = await this.executeQuery(queryCategory, queryName, params);
            console.log('Data:', data);
            return data;
        } catch (err) {
            console.error('Error fetching data:', err);
            throw err;
        }
    }
}