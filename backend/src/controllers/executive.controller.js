const { APIError } = require('../middleware/error-handler');
const executiveService = require('../services/executive.service');

/**
 * Executive Controller — HUF10.
 * Handles HTTP requests for the Executive One-Pager Dashboard.
 */

/**
 * GET /api/v1/executive/summary — Complete executive dashboard.
 */
const getSummary = async (req, res, next) => {
  try {
    let data;

    if (req.app.locals.executiveRepository) {
      const currentSpend = await req.app.locals.executiveRepository.getCurrentMonthSpend();
      const previousSpend = await req.app.locals.executiveRepository.getPreviousMonthSpend();
      const topConsumers = await req.app.locals.executiveRepository.getTop5Consumers();
      const avgCostPerTransaction = await req.app.locals.executiveRepository.getAverageCostPerTransaction();
      const criticalAlerts = await req.app.locals.executiveRepository.getOpenCriticalAlerts();
      const selfFundingRatio = await req.app.locals.executiveRepository.getSelfFundingRatio();

      data = { currentSpend, previousSpend, topConsumers, avgCostPerTransaction, criticalAlerts, selfFundingRatio };
    } else {
      // Stub data for prototype
      data = {
        currentSpend: 385000000,
        previousSpend: 352000000,
        topConsumers: [
          { name: 'Claude 3.5 Sonnet (Bedrock)', spendCop: 120000000 },
          { name: 'GPT-4o', spendCop: 85000000 },
          { name: 'Célula Datos - AWS', spendCop: 62000000 },
          { name: 'Célula Digital - Azure', spendCop: 48000000 },
          { name: 'MongoDB Atlas', spendCop: 35000000 },
        ],
        avgCostPerTransaction: 4520,
        previousAvgCostPerTransaction: 4100,
        criticalAlerts: 2,
        selfFundingRatio: 73.4,
      };
    }

    const summary = executiveService.buildExecutiveSummary(data);

    res.json(summary);
  } catch (err) {
    next(err);
  }
};

module.exports = { getSummary };
