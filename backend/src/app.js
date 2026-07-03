const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { correlationId } = require('./middleware/correlation-id');
const { auth } = require('./middleware/auth');
const { errorHandler } = require('./middleware/error-handler');

const app = express();

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
  exposedHeaders: ['X-Correlation-ID'],
}));

// JSON body parser with size limit
app.use(express.json({ limit: '1mb' }));

// Correlation ID propagation (before auth so it's available in error responses)
app.use(correlationId);

// Health check (no auth required)
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    correlationId: req.correlationId,
  });
});

// Simulated JWT authentication for all /api routes except health
app.use('/api/v1', (req, res, next) => {
  // Skip auth for health endpoint
  if (req.path === '/health') {
    return next();
  }
  return auth(req, res, next);
});

// Domain routes will be registered here as they are implemented

// Error handler — must be last middleware
app.use(errorHandler);

module.exports = app;
