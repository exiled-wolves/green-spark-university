const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: connectionString?.includes('localhost') ? false : { rejectUnauthorized: false }
});

// Test connection on startup
(async () => {
  try {
    const client = await pool.connect();
    console.log('✅  PostgreSQL connected — Green Spark University DB');
    client.release();
  } catch (err) {
    console.error('❌  PostgreSQL connection failed:', err.message);
    process.exit(1);
  }
})();

module.exports = pool;
