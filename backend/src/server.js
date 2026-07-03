'use strict';

require('dotenv').config();

const app = require('./app');
const { pool } = require('./config/db');

const PORT = parseInt(process.env.PORT || '3001', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Starts the HTTP server and binds to the configured port.
 * @returns {import('http').Server}
 */
const server = app.listen(PORT, () => {
  console.info('[server] started', {
    port: PORT,
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Gracefully shuts down the server by closing new connections,
 * draining the database pool, and exiting the process.
 * @param {string} signal - The OS signal that triggered shutdown
 */
const gracefulShutdown = async (signal) => {
  console.info('[server] shutdown initiated', { signal, timestamp: new Date().toISOString() });

  server.close(() => {
    console.info('[server] http server closed — no longer accepting connections');
  });

  try {
    await pool.end();
    console.info('[server] database pool closed');
  } catch (err) {
    console.error('[server] error closing database pool', { error: err.message });
  }

  console.info('[server] shutdown complete');
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = server;
