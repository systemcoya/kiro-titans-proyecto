/**
 * Alert routes: CRUD rules, active alerts, history.
 * Prefix: /api/v1/alerts
 */
const { Router } = require('express');

const router = Router();

/** GET /rules — List alert rules */
router.get('/rules', (req, res) => {
  res.json([]);
});

/** POST /rules — Create a new alert rule */
router.post('/rules', (req, res) => {
  res.status(201).json({ id: null, message: 'Rule created (stub)' });
});

/** PUT /rules/:id — Update an alert rule */
router.put('/rules/:id', (req, res) => {
  res.json({ id: req.params.id, message: 'Rule updated (stub)' });
});

/** DELETE /rules/:id — Delete an alert rule */
router.delete('/rules/:id', (req, res) => {
  res.status(204).send();
});

/** GET /active — Active alerts sorted by severity then date */
router.get('/active', (req, res) => {
  res.json([]);
});

/** GET /history — Alert history with pagination */
router.get('/history', (req, res) => {
  res.json({ data: [], page: 1, pageSize: 100, total: 0 });
});

module.exports = router;
