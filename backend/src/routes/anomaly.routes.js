'use strict';

const { Router } = require('express');
const anomalyService = require('../services/anomaly.service');

const router = Router();

/**
 * GET /api/v1/anomalies
 * Returns detected anomalies sorted by severity descending.
 */
router.get('/', async (req, res, next) => {
  try {
    const anomalies = await anomalyService.detectAnomalies();
    return res.json(anomalies);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
