const { Pool } = require('pg');
require('dotenv').config();

// Use POSTGRES_URL_NON_POOLING for direct connection, fallback to POSTGRES_URL
const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.DATABASE_URL;

// Append sslmode if not present
const finalConnectionString = connectionString?.includes('sslmode=') 
  ? connectionString 
  : `${connectionString}${connectionString?.includes('?') ? '&' : '?'}sslmode=require`;

const pool = new Pool({
  connectionString: finalConnectionString,
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
