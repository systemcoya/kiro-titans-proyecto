const executiveService = require('../services/executive.service');
const executiveRepository = require('../repositories/executive.repository');

/**
 * Executive Controller — HUF10.
 * Handles HTTP requests for the Executive One-Pager Dashboard.
 */

/**
 * GET /api/v1/executive/summary — Complete executive dashboard.
 */
const getSummary = async (req, res, next) => {
  try {
    const [currentSpend, previousSpend, topConsumers, avgCostPerTransaction, criticalAlerts, selfFundingRatio] =
      await Promise.all([
        executiveRepository.getCurrentMonthSpend(),
        executiveRepository.getPreviousMonthSpend(),
        executiveRepository.getTop5Consumers(),
        executiveRepository.getAverageCostPerTransaction(),
        executiveRepository.getOpenCriticalAlerts(),
        executiveRepository.getSelfFundingRatio(),
      ]);

    const data = {
      currentSpend: currentSpend * 4200,
      previousSpend: previousSpend * 4200,
      topConsumers,
      avgCostPerTransaction,
      previousAvgCostPerTransaction: avgCostPerTransaction,
      criticalAlerts,
      selfFundingRatio,
    };

    const summary = executiveService.buildExecutiveSummary(data);

    res.json(summary);
  } catch (err) {
    next(err);
  }
};

module.exports = { getSummary };
