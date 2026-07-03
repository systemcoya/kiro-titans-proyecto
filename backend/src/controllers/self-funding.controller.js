const { APIError } = require('../middleware/error-handler');
const { timelineQuerySchema } = require('../validators/self-funding.validator');
const selfFundingService = require('../services/self-funding.service');

/**
 * Self-Funding Controller — HUF08.
 * Handles HTTP requests for AI Investment vs Savings dashboard.
 */

/**
 * GET /api/v1/self-funding — Dashboard overview with ratio.
 */
const getDashboard = async (req, res, next) => {
  try {
    let data;

    if (req.app.locals.selfFundingRepository) {
      const totalAiInvestment = await req.app.locals.selfFundingRepository.getTotalAiInvestment();
      const totalSavings = await req.app.locals.selfFundingRepository.getTotalSavings();
      const previousRatio = await req.app.locals.selfFundingRepository.getPreviousMonthRatio();

      data = { totalAiInvestment, totalSavings, previousRatio };
    } else {
      // Stub data for prototype
      data = {
        totalAiInvestment: 245000000,
        totalSavings: 179850000,
        previousRatio: 68.5,
      };
    }

    const dashboard = selfFundingService.buildSelfFundingDashboard(data);

    res.json(dashboard);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/self-funding/timeline — Monthly evolution.
 */
const getTimeline = async (req, res, next) => {
  try {
    const parsed = timelineQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new APIError(400, 'Bad Request', 'Parámetros de consulta inválidos');
    }

    const { months } = parsed.data;

    let timeline;
    if (req.app.locals.selfFundingRepository) {
      timeline = await req.app.locals.selfFundingRepository.getMonthlyEvolution(months);
    } else {
      // Stub: generate realistic progression where savings grow over time
      timeline = Array.from({ length: months }, (_, i) => {
        const monthDate = new Date();
        monthDate.setMonth(monthDate.getMonth() - (months - 1 - i));

        const baseInvestment = 18000000 + (i * 2000000);
        const baseSavings = 5000000 + (i * 3500000);

        return {
          month: monthDate.toISOString().slice(0, 7),
          investmentCop: baseInvestment,
          savingsCop: baseSavings,
          cumulativeInvestment: baseInvestment * (i + 1),
          cumulativeSavings: baseSavings * (i + 1),
        };
      });
    }

    res.json({ data: timeline, months });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard, getTimeline };
