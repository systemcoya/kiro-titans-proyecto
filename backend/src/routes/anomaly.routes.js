/**
 * Anomaly routes: Detected anomalies.
 * Prefix: /api/v1/anomalies
 */
const { Router } = require('express');

const router = Router();

/** GET / — List detected anomalies */
router.get('/', (req, res) => {
  res.json([]);
});

module.exports = router;
