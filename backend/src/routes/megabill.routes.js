'use strict';

const { Router } = require('express');
const { APIError } = require('../middleware/error-handler');
const megabillService = require('../services/megabill.service');
const { validateCategoryParam } = require('../validators/megabill.validator');

const router = Router();

/**
 * GET /api/v1/costs/megabill
 * Returns MegaBill summary with totals by category (cloud, saas, licenses)
 * and percentage distribution.
 */
router.get('/megabill', async (req, res, next) => {
  try {
    const result = await megabillService.getMegaBill();
    return res.json(result);
  } catch (error) {
    return next(error);
  }
});

/**
 * GET /api/v1/costs/megabill/:category
 * Returns drill-down details for a specific category with individual services
 * normalized to FOCUS format (ServiceName, BilledCost, UsageQuantity, Provider).
 */
router.get('/megabill/:category', async (req, res, next) => {
  try {
    const validation = validateCategoryParam(req.params.category);

    if (!validation.success) {
      const details = validation.error.issues.map((issue) => ({
        field: 'category',
        reason: issue.message,
      }));
      throw new APIError(400, 'Bad Request', 'Parámetro de categoría inválido', details);
    }

    const { category } = validation.data;
    const result = await megabillService.getDrillDown(category);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
