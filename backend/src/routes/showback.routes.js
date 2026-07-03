'use strict';

const { Router } = require('express');
const showbackService = require('../services/showback.service');
const { validateShowbackQuery } = require('../validators/showback.validator');

const router = Router();

/**
 * GET /api/v1/costs/showback
 * Returns per-team cost breakdown with budget analysis and efficiency ranking.
 * @query {string} [month] - Optional month in YYYY-MM or YYYY-MM-DD format
 * @returns {{teams: Array, ranking: Array}} Showback response
 */
router.get('/showback', validateShowbackQuery, async (req, res, next) => {
  try {
    const { month } = req.validatedQuery;
    const result = await showbackService.getShowback(month);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
