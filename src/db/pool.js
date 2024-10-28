require('dotenv').config();
const { Pool } = require('pg');

module.exports = {
  pool: new Pool({
    host: process.env.DB_HOST || '',
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || '',
    port: process.env.DB_PORT || 5432,
  })
}

async function insertData(name) {
  const client = await pool.connect();
  try {
    const queryText = 'INSERT INTO profile (email, name, age) VALUES (\'nati@gmail.com\', \'nati\', 22 RETURNING id';
    const res = await client.query(queryText, [name]);
    console.log('Inserted row with id:', res.rows[0].id);
  } catch (err) {
    console.error('Error inserting data:', err.stack);
  } finally {
    client.release();
  }
}

async function getData() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT * FROM profile');
    console.log('Data:', res.rows);
  } catch (err) {
    console.error('Error fetching data:', err.stack);
  } finally {
    client.release();
  }
}

(async () => {
  await insertData('John Doe');
  await getData();
})();