const anomalyService = require('../services/anomaly-detection.service');
const anomalyRepository = require('../repositories/anomaly-detection.repository');

/**
 * Anomaly Detection Controller — Task 15.1
 */

/**
 * GET /api/v1/anomalies — Detect current anomalies.
 */
const getAnomalies = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days, 10) || 7;
    const stats = await anomalyRepository.getRecentStats(days);
    const anomalies = anomalyService.detectAnomalies(stats);
    const summary = anomalyService.summarizeAnomalies(anomalies);

    res.json({ data: anomalies, summary });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/anomalies/service/:serviceName — Anomalies for a specific service.
 */
const getServiceAnomalies = async (req, res, next) => {
  try {
    const { serviceName } = req.params;
    const days = parseInt(req.query.days, 10) || 30;
    const stats = await anomalyRepository.getStatsByService(serviceName, days);
    const anomalies = anomalyService.detectAnomalies(stats);

    res.json({ data: anomalies, serviceName, daysAnalyzed: days });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAnomalies, getServiceAnomalies };
