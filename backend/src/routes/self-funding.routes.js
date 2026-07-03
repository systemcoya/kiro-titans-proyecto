/**
 * Self-Funding routes: Investment vs. savings ratio.
 * Prefix: /api/v1/self-funding
 */
const { Router } = require('express');

const router = Router();

/** GET / — Self-funding ratio for a period */
router.get('/', (req, res) => {
  res.json({
    investmentUsd: 0,
    savingsUsd: 0,
    selfFundingRatio: 0,
    period: req.query.period || 'month',
  });
});

module.exports = router;
