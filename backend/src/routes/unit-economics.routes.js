'use strict';

const { Router } = require('express');
const { validateUnitEconomicsQuery } = require('../validators/unit-economics.validator');
const unitEconomicsService = require('../services/unit-economics.service');
const { APIError } = require('../middleware/error-handler');

const router = Router();

/**
 * GET /api/v1/costs/unit-economics
 * Returns unit economics data per service/use case for the specified period.
 * Query params: ?period=week|month OR ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */
router.get('/unit-economics', async (req, res, next) => {
  try {
    const validatedParams = validateUnitEconomicsQuery(req.query);
    const result = await unitEconomicsService.getUnitEconomics(validatedParams);
    return res.status(200).json(result);
  } catch (err) {
    if (err.name === 'ZodError') {
      const details = err.errors.map((e) => ({
        field: e.path.join('.'),
        reason: e.message,
      }));
      return next(new APIError(400, 'Bad Request', 'Validation failed for unit economics query', details));
    }
    return next(err);
  }
});

module.exports = router;
