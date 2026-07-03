/**
 * Server entry point with graceful shutdown.
 * Loads environment variables, starts HTTP server,
 * and handles SIGTERM/SIGINT for clean shutdown.
 */
require('dotenv').config();

const app = require('./app');
const { pool } = require('./config/db');

const PORT = parseInt(process.env.PORT || '3000', 10);

const server = app.listen(PORT, () => {
  console.log(`[SERVER] Listening on port ${PORT}`, {
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Graceful shutdown handler.
 * Stops accepting new connections, closes DB pool, then exits.
 * @param {string} signal - The signal that triggered shutdown
 */
const shutdown = (signal) => {
  console.log(`[SERVER] ${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    console.log('[SERVER] HTTP server closed. Draining DB pool...');
    try {
      await pool.end();
      console.log('[SERVER] DB pool closed. Exiting.');
    } catch (err) {
      console.error('[SERVER] Error closing DB pool:', err.message);
    }
    process.exit(0);
  });

  // Force exit after 10s if graceful shutdown hangs
  setTimeout(() => {
    console.error('[SERVER] Forced exit after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
