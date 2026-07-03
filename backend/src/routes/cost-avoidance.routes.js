'use strict';

const { Router } = require('express');
const { APIError } = require('../middleware/error-handler');
const costAvoidanceService = require('../services/cost-avoidance.service');
const { validateCostAvoidanceAction, validateMonthQuery } = require('../validators/cost-avoidance.validator');

const router = Router();

/**
 * GET /api/v1/cost-avoidance
 * Returns cost avoidance report for a given month.
 */
router.get('/', async (req, res, next) => {
  try {
    const { month } = validateMonthQuery(req.query);
    const result = await costAvoidanceService.getReport(month);
    return res.json(result);
  } catch (error) {
    if (error.name === 'ZodError') {
      const details = error.errors.map((e) => ({ field: e.path.join('.'), reason: e.message }));
      return next(new APIError(400, 'Bad Request', 'Parámetros inválidos', details));
    }
    return next(error);
  }
});

/**
 * POST /api/v1/cost-avoidance
 * Registers a new preventive cost avoidance action.
 */
router.post('/', async (req, res, next) => {
  try {
    const data = validateCostAvoidanceAction(req.body);
    const result = await costAvoidanceService.createAction(data);
    return res.status(201).json(result);
  } catch (error) {
    if (error.name === 'ZodError') {
      const details = error.errors.map((e) => ({ field: e.path.join('.'), reason: e.message }));
      return next(new APIError(400, 'Bad Request', 'Datos de acción inválidos', details));
    }
    return next(error);
  }
});

module.exports = router;
