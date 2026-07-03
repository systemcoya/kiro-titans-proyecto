const alertsRoutes = require('./alerts.routes');
const governanceRoutes = require('./governance.routes');
const simulatorRoutes = require('./simulator.routes');
const selfFundingRoutes = require('./self-funding.routes');
const executiveRoutes = require('./executive.routes');
const finopsSummaryController = require('../controllers/finops-summary.controller');

/**
 * Route Registration — Jorge's services.
 * Call registerRoutes(app) from app.js to mount all routes.
 *
 * Sergio: import this file in app.js and call registerRoutes(app)
 * after the auth middleware is applied.
 */
const registerRoutes = (app) => {
  app.use('/api/v1/alerts', alertsRoutes);
  app.use('/api/v1/governance', governanceRoutes);
  app.use('/api/v1/simulator', simulatorRoutes);
  app.use('/api/v1/self-funding', selfFundingRoutes);
  app.use('/api/v1/executive', executiveRoutes);

  // RT-10 Integration Contract
  app.get('/api/v1/finops/summary', finopsSummaryController.getSummary);
};

module.exports = { registerRoutes };
