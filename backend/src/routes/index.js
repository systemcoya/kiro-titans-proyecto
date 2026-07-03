const alertsRoutes = require('./alerts.routes');
const governanceRoutes = require('./governance.routes');
const simulatorRoutes = require('./simulator.routes');
const selfFundingRoutes = require('./self-funding.routes');
const executiveRoutes = require('./executive.routes');
const costAvoidanceRoutes = require('./cost-avoidance.routes');
const taggingRoutes = require('./tagging.routes');
const anomalyRoutes = require('./anomaly-detection.routes');
const finopsSummaryController = require('../controllers/finops-summary.controller');

/**
 * Route Registration — Jorge's services.
 * Call registerRoutes(app) from app.js to mount all routes.
 */
const registerRoutes = (app) => {
  app.use('/api/v1/alerts', alertsRoutes);
  app.use('/api/v1/governance', governanceRoutes);
  app.use('/api/v1/simulator', simulatorRoutes);
  app.use('/api/v1/self-funding', selfFundingRoutes);
  app.use('/api/v1/executive', executiveRoutes);
  app.use('/api/v1/cost-avoidance', costAvoidanceRoutes);
  app.use('/api/v1/tagging', taggingRoutes);
  app.use('/api/v1/anomalies', anomalyRoutes);

  // RT-10 Integration Contract
  app.get('/api/v1/finops/summary', finopsSummaryController.getSummary);
};

module.exports = { registerRoutes };
