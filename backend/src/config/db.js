const { Pool } = require('pg');

/**
 * PostgreSQL connection pool configuration.
 * Uses DATABASE_URL if available, otherwise builds from individual env vars.
 * @type {import('pg').Pool}
 */
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        database: process.env.DB_NAME || 'ai_cost_tracker',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        max: parseInt(process.env.DB_POOL_MAX || '10', 10),
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      }
);

pool.on('error', (err) => {
  console.error('[db] Unexpected pool error', { error: err.message });
});

/**
 * Executes a parameterized query against the database.
 * @param {string} text - SQL query with $1, $2, ... placeholders
 * @param {Array} params - Parameter values
 * @returns {Promise<import('pg').QueryResult>}
 */
const query = (text, params) => {
  return pool.query(text, params);
};

/**
 * Gets a client from the pool for transaction support.
 * @returns {Promise<import('pg').PoolClient>}
 */
const getClient = () => {
  return pool.connect();
};

module.exports = { pool, query, getClient };
