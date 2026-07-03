const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { correlationId } = require('./middleware/correlation-id');
const { auth } = require('./middleware/auth');
const { errorHandler } = require('./middleware/error-handler');

// Route modules — Sergio (core)
const costRoutes = require('./routes/cost.routes');
const unitEconomicsRoutes = require('./routes/unit-economics.routes');
const showbackRoutes = require('./routes/showback.routes');
const megabillRoutes = require('./routes/megabill.routes');

// Route modules — Jorge (advanced services)
const alertsRoutes = require('./routes/alerts.routes');
const simulatorRoutes = require('./routes/simulator.routes');
const governanceRoutes = require('./routes/governance.routes');
const taggingRoutes = require('./routes/tagging.routes');
const anomalyRoutes = require('./routes/anomaly-detection.routes');
const executiveRoutes = require('./routes/executive.routes');
const selfFundingRoutes = require('./routes/self-funding.routes');
const costAvoidanceRoutes = require('./routes/cost-avoidance.routes');
const finopsSummaryController = require('./controllers/finops-summary.controller');

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

// Domain routes — mounted after auth middleware
app.use('/api/v1/costs', costRoutes);
app.use('/api/v1/costs', unitEconomicsRoutes);
app.use('/api/v1/costs', showbackRoutes);
app.use('/api/v1/costs', megabillRoutes);

// Jorge's advanced services
app.use('/api/v1/alerts', alertsRoutes);
app.use('/api/v1/simulator', simulatorRoutes);
app.use('/api/v1/governance', governanceRoutes);
app.use('/api/v1/tagging', taggingRoutes);
app.use('/api/v1/anomalies', anomalyRoutes);
app.use('/api/v1/executive', executiveRoutes);
app.use('/api/v1/self-funding', selfFundingRoutes);
app.use('/api/v1/cost-avoidance', costAvoidanceRoutes);
app.get('/api/v1/finops/summary', finopsSummaryController.getSummary);

// Error handler — must be last middleware
app.use(errorHandler);

module.exports = app;
