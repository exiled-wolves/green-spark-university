const { Pool } = require('pg');
require('dotenv').config();

// Create PostgreSQL pool using Supabase connection string
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Helper to convert MySQL-style queries (?) to PostgreSQL-style ($1, $2, ...)
const convertPlaceholders = (query) => {
  let index = 0;
  return query.replace(/\?/g, () => `$${++index}`);
};

// Wrapper to maintain MySQL-compatible interface
const query = async (text, params = []) => {
  const convertedQuery = convertPlaceholders(text);
  const result = await pool.query(convertedQuery, params);
  // Return [rows, fields] format like mysql2
  // Also add affectedRows for compatibility with UPDATE/DELETE
  const rows = result.rows;
  rows.affectedRows = result.rowCount;
  return [rows, result.fields];
};

// Get a client from the pool for transactions
const getConnection = async () => {
  const client = await pool.connect();
  
  return {
    query: async (text, params = []) => {
      const convertedQuery = convertPlaceholders(text);
      const result = await client.query(convertedQuery, params);
      const rows = result.rows;
      rows.affectedRows = result.rowCount;
      return [rows, result.fields];
    },
    beginTransaction: async () => {
      await client.query('BEGIN');
    },
    commit: async () => {
      await client.query('COMMIT');
    },
    rollback: async () => {
      await client.query('ROLLBACK');
    },
    release: () => {
      client.release();
    }
  };
};

// Test connection on startup
(async () => {
  try {
    const client = await pool.connect();
    console.log('✅  PostgreSQL connected — Green Spark University DB (Supabase)');
    client.release();
  } catch (err) {
    console.error('❌  PostgreSQL connection failed:', err.message);
    process.exit(1);
  }
})();

module.exports = { query, getConnection };
