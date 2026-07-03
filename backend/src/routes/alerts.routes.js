const express = require('express');
const alertsController = require('../controllers/alerts.controller');

const router = express.Router();

/**
 * Alert Routes — HUF04 Configurable Threshold Alerts.
 * RBAC: GET = viewer+, POST/PUT = manager+, DELETE = admin only.
 */

// GET /api/v1/alerts — List active alert rules
router.get('/', alertsController.listAlerts);

// POST /api/v1/alerts — Create alert rule (manager, admin)
router.post('/', alertsController.createAlert);

// PUT /api/v1/alerts/:id — Update alert rule (manager, admin)
router.put('/:id', alertsController.updateAlert);

// DELETE /api/v1/alerts/:id — Delete alert rule (admin only)
router.delete('/:id', alertsController.deleteAlert);

// GET /api/v1/alerts/history — Alert trigger history
router.get('/history', alertsController.getAlertHistory);

// POST /api/v1/alerts/evaluate — Evaluate all alerts (internal/admin)
router.post('/evaluate', alertsController.evaluateAllAlerts);

module.exports = router;
