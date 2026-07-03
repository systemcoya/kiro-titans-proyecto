/**
 * Cost routes: AI Spend, Unit Economics, Showback, MegaBill.
 * Prefix: /api/v1/costs
 */
const { Router } = require('express');

const router = Router();

/** GET /ai-spend — AI cost breakdown with filters */
router.get('/ai-spend', (req, res) => {
  res.json({
    totalCost: 0,
    breakdown: [],
    filters: { startDate: null, endDate: null },
  });
});

/** POST /ai-spend/advance — Simulate temporal advance (+1h) */
router.post('/ai-spend/advance', (req, res) => {
  res.json({ message: 'Temporal advance simulated', newRecords: 0 });
});

/** GET /unit-economics — Unit cost per service/use case */
router.get('/unit-economics', (req, res) => {
  res.json([]);
});

/** GET /showback — Showback per team */
router.get('/showback', (req, res) => {
  res.json([]);
});

/** GET /megabill — Consolidated view by category */
router.get('/megabill', (req, res) => {
  res.json({ cloud: 0, saas: 0, licenses: 0, total: 0, services: [] });
});

/** GET /megabill/:category — Drill-down by category */
router.get('/megabill/:category', (req, res) => {
  const { category } = req.params;
  const validCategories = ['cloud', 'saas', 'licenses'];
  if (!validCategories.includes(category)) {
    return res.status(400).json({
      statusCode: 400,
      error: 'Bad Request',
      message: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
      correlationId: req.correlationId,
    });
  }
  res.json({ category, services: [] });
});

module.exports = router;
