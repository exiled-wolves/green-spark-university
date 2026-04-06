const { Pool } = require('pg');
require('dotenv').config();

// Check for required environment variables
if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
  console.error('❌ ERROR: POSTGRES_URL or DATABASE_URL environment variable is not set');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.warn('⚠️  WARNING: JWT_SECRET environment variable is not set. Auth will fail!');
}

// Use POSTGRES_URL_NON_POOLING for direct connection, fallback to POSTGRES_URL
let connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.DATABASE_URL;

// Fix SSL mode for pg library - use libpq compatibility mode as recommended
if (connectionString) {
  // Remove any existing sslmode parameter
  connectionString = connectionString.replace(/[?&]sslmode=[^&]*/g, '');
  // Clean up any trailing ? or &
  connectionString = connectionString.replace(/[?&]$/, '');
  // Add libpq compatibility mode with sslmode=require
  const separator = connectionString.includes('?') ? '&' : '?';
  connectionString = `${connectionString}${separator}sslmode=no-verify`;
}

const pool = new Pool({
  connectionString,
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
