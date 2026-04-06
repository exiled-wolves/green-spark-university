const { Pool } = require('pg');
require('dotenv').config();

// Use POSTGRES_URL_NON_POOLING for direct connection, fallback to POSTGRES_URL
let connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.DATABASE_URL;

// Remove sslmode from connection string as we handle it separately
if (connectionString) {
  connectionString = connectionString.replace(/[?&]sslmode=[^&]*/g, '');
  // Clean up any trailing ? or &
  connectionString = connectionString.replace(/[?&]$/, '');
}

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
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
