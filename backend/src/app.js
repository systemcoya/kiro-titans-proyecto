const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { correlationId } = require('./middleware/correlation-id');
const { auth } = require('./middleware/auth');
const { errorHandler } = require('./middleware/error-handler');

// Route modules
const costRoutes = require('./routes/cost.routes');
const unitEconomicsRoutes = require('./routes/unit-economics.routes');
const showbackRoutes = require('./routes/showback.routes');
const megabillRoutes = require('./routes/megabill.routes');

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

// Additional domain routes
app.use('/api/v1/cost-avoidance', require('./routes/cost-avoidance.routes'));
app.use('/api/v1/tagging', require('./routes/tagging.routes'));
app.use('/api/v1/anomalies', require('./routes/anomaly.routes'));

// Jorge's advanced services
app.use('/api/v1/alerts', require('./routes/alerts.routes'));
app.use('/api/v1/simulator', require('./routes/simulator.routes'));
app.use('/api/v1/governance', require('./routes/governance.routes'));
app.use('/api/v1/self-funding', require('./routes/self-funding.routes'));
app.use('/api/v1/executive', require('./routes/executive.routes'));
app.get('/api/v1/finops/summary', require('./controllers/finops-summary.controller').getSummary);

// Error handler — must be last middleware
app.use(errorHandler);

module.exports = app;
