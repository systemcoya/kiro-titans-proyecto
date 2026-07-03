'use strict';

const { Router } = require('express');
const { ZodError } = require('zod');
const { validateCostFilters } = require('../validators/cost.validator');
const costService = require('../services/cost.service');
const { APIError } = require('../middleware/error-handler');

const router = Router();

/**
 * GET /api/v1/costs/ai-spend
 * Returns AI spend breakdown with totals, percentages, and consumption metrics.
 * Query params: startDate, endDate, team (optional), provider (optional), groupBy (optional, default 'service')
 */
router.get('/ai-spend', async (req, res, next) => {
  try {
    const input = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      team: req.query.team,
      provider: req.query.provider,
      groupBy: req.query.groupBy,
    };

    // Remove undefined keys to let Zod defaults apply
    Object.keys(input).forEach((key) => {
      if (input[key] === undefined) {
        delete input[key];
      }
    });

    const filters = validateCostFilters(input);
    const result = await costService.getAISpend(filters);

    return res.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.errors.map((err) => ({
        field: err.path.join('.'),
        reason: err.message,
      }));
      return next(new APIError(400, 'Bad Request', 'Validation failed', details));
    }
    return next(error);
  }
});

/**
 * POST /api/v1/costs/ai-spend/advance
 * Generates new mock AI cost values simulating +1 hour of consumption.
 * Used for temporal advance demonstration.
 */
router.post('/ai-spend/advance', async (req, res, next) => {
  try {
    const result = await costService.advanceTime();

    return res.status(201).json({
      message: 'Temporal advance completed',
      recordsCreated: result.recordsCreated,
      simulatedTime: result.simulatedTime,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
