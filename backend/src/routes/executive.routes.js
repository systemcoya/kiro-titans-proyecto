/**
 * Executive routes: Dashboard KPIs, PDF export.
 * Prefix: /api/v1/executive
 */
const { Router } = require('express');

const router = Router();

/** GET /dashboard — Executive KPIs */
router.get('/dashboard', (req, res) => {
  res.json({
    currentMonthSpend: 0,
    previousMonthSpend: 0,
    variationPercent: 0,
    variationFlagged: false,
    avgCostPerTransaction: 0,
    criticalAlertsCount: 0,
    topServices: [],
    monthlyTrend: [],
  });
});

/** GET /export-pdf — Export executive dashboard as PDF */
router.get('/export-pdf', (req, res) => {
  res.status(200).json({ message: 'PDF export endpoint (stub)' });
});

module.exports = router;
