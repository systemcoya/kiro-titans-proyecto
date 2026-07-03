/**
 * Simulator routes: What-If projection.
 * Prefix: /api/v1/simulator
 */
const { Router } = require('express');

const router = Router();

/** POST /projection — Run what-if simulation */
router.post('/projection', (req, res) => {
  res.json({
    projections: [
      { month: 1, optimistic: 0, base: 0, pessimistic: 0 },
      { month: 3, optimistic: 0, base: 0, pessimistic: 0 },
      { month: 6, optimistic: 0, base: 0, pessimistic: 0 },
    ],
    historicalBase: [],
  });
});

module.exports = router;
