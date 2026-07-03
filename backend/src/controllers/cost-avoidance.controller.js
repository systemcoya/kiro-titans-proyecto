const { APIError } = require('../middleware/error-handler');
const costAvoidanceService = require('../services/cost-avoidance.service');
const costAvoidanceRepository = require('../repositories/cost-avoidance.repository');

/**
 * Cost Avoidance Controller — Task 12.1
 */

/**
 * GET /api/v1/cost-avoidance — List avoidance records with totals.
 */
const listAvoidance = async (req, res, next) => {
  try {
    const { startDate, endDate, limit, offset } = req.query;
    const records = await costAvoidanceRepository.listAvoidanceRecords({
      startDate, endDate,
      limit: parseInt(limit, 10) || 50,
      offset: parseInt(offset, 10) || 0,
    });

    const totals = costAvoidanceService.calculateTotalAvoidance(records);
    const byType = costAvoidanceService.groupByActionType(records);

    res.json({ data: records, totals, byActionType: byType });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/cost-avoidance — Record a new avoidance action.
 * Requires role: manager or admin.
 */
const createAvoidance = async (req, res, next) => {
  try {
    if (req.user.role === 'viewer') {
      throw new APIError(403, 'Forbidden', 'No tiene permisos para registrar cost avoidance');
    }

    const { resource, actionType, actionDate, estimatedSavingsUsd } = req.body;

    if (!resource || !actionType || !actionDate || !estimatedSavingsUsd) {
      throw new APIError(400, 'Bad Request', 'Faltan campos requeridos: resource, actionType, actionDate, estimatedSavingsUsd');
    }

    if (estimatedSavingsUsd <= 0) {
      throw new APIError(400, 'Bad Request', 'estimatedSavingsUsd debe ser mayor a cero');
    }

    const record = await costAvoidanceRepository.createAvoidanceRecord({
      resource, actionType, actionDate, estimatedSavingsUsd,
    });

    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/cost-avoidance/trend — Monthly trend.
 */
const getTrend = async (req, res, next) => {
  try {
    const records = await costAvoidanceRepository.listAvoidanceRecords({ limit: 500 });
    const trend = costAvoidanceService.calculateMonthlyTrend(records);

    res.json({ data: trend });
  } catch (err) {
    next(err);
  }
};

module.exports = { listAvoidance, createAvoidance, getTrend };
