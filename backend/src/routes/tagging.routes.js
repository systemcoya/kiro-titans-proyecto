/**
 * Tagging routes: CRUD resource tags, compliance.
 * Prefix: /api/v1/tagging
 */
const { Router } = require('express');

const router = Router();

/** GET /resources — List tagged resources */
router.get('/resources', (req, res) => {
  res.json([]);
});

/** POST /resources — Create resource tag */
router.post('/resources', (req, res) => {
  res.status(201).json({ id: null, message: 'Resource tag created (stub)' });
});

/** PUT /resources/:id — Update resource tag */
router.put('/resources/:id', (req, res) => {
  res.json({ id: req.params.id, message: 'Resource tag updated (stub)' });
});

/** DELETE /resources/:id — Delete resource tag */
router.delete('/resources/:id', (req, res) => {
  res.status(204).send();
});

/** GET /compliance — Tagging compliance percentage */
router.get('/compliance', (req, res) => {
  res.json({ compliancePercent: 0, totalResources: 0, compliantResources: 0 });
});

module.exports = router;
