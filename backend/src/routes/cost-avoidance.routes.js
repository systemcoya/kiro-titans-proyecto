/**
 * Cost Avoidance routes: Report and create preventive actions.
 * Prefix: /api/v1/cost-avoidance
 */
const { Router } = require('express');

const router = Router();

/** GET / — Cost avoidance report for a month */
router.get('/', (req, res) => {
  res.json({ actions: [], totalSavings: 0, month: req.query.month || null });
});

/** POST / — Register a new preventive action */
router.post('/', (req, res) => {
  res.status(201).json({ id: null, message: 'Action registered (stub)' });
});

module.exports = router;
