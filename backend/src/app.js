/**
 * Express application setup.
 * Configures security headers, CORS, JSON parsing, middleware,
 * and registers all route modules under /api/v1.
 */
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const { correlationId } = require('./middleware/correlation-id');
const { errorHandler } = require('./middleware/error-handler');

// Route modules
const healthRoutes = require('./routes/health.routes');
const costRoutes = require('./routes/cost.routes');
const alertRoutes = require('./routes/alert.routes');
const simulatorRoutes = require('./routes/simulator.routes');
const governanceRoutes = require('./routes/governance.routes');
const selfFundingRoutes = require('./routes/self-funding.routes');
const costAvoidanceRoutes = require('./routes/cost-avoidance.routes');
const executiveRoutes = require('./routes/executive.routes');
const taggingRoutes = require('./routes/tagging.routes');
const anomalyRoutes = require('./routes/anomaly.routes');

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors());

// JSON body parser (limit body size to prevent abuse)
app.use(express.json({ limit: '1mb' }));

// Correlation ID on every request
app.use(correlationId);

// API routes — all under /api/v1
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/costs', costRoutes);
app.use('/api/v1/alerts', alertRoutes);
app.use('/api/v1/simulator', simulatorRoutes);
app.use('/api/v1/governance', governanceRoutes);
app.use('/api/v1/self-funding', selfFundingRoutes);
app.use('/api/v1/cost-avoidance', costAvoidanceRoutes);
app.use('/api/v1/executive', executiveRoutes);
app.use('/api/v1/tagging', taggingRoutes);
app.use('/api/v1/anomalies', anomalyRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    statusCode: 404,
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    correlationId: req.correlationId,
  });
});

// Centralized error handler (must be last)
app.use(errorHandler);

module.exports = app;
