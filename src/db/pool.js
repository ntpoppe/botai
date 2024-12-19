require('dotenv').config();
const { Pool } = require('pg');

module.exports = {
  pool: new Pool({
    host: process.env.DB_HOST || '',
    user: process.env.DB_USER || '',
    database: process.env.DB_DATABASE || '',
    port: process.env.DB_PORT || 5432,
  })
}
