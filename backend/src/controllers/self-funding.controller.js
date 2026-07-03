const { APIError } = require('../middleware/error-handler');
const { timelineQuerySchema } = require('../validators/self-funding.validator');
const selfFundingService = require('../services/self-funding.service');
const selfFundingRepository = require('../repositories/self-funding.repository');

/**
 * Self-Funding Controller — HUF08.
 * Handles HTTP requests for AI Investment vs Savings dashboard.
 */

/**
 * GET /api/v1/self-funding — Dashboard overview with ratio.
 */
const getDashboard = async (req, res, next) => {
  try {
    const totalAiInvestment = await selfFundingRepository.getTotalAiInvestment(12);
    const totalSavings = await selfFundingRepository.getTotalSavings(12);

    // Calculate previous month ratio for trend
    const prevInvestment = await selfFundingRepository.getTotalAiInvestment(13);
    const prevSavings = await selfFundingRepository.getTotalSavings(13);
    const previousRatio = prevInvestment > 0 ? (prevSavings / prevInvestment) * 100 : 0;

    const data = { totalAiInvestment, totalSavings, previousRatio };
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
    const timeline = await selfFundingRepository.getMonthlyEvolution(months);

    res.json({ data: timeline, months });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard, getTimeline };
