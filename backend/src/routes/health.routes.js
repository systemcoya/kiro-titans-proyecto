/**
 * Health check route.
 * Prefix: /api/v1/health
 */
const { Router } = require('express');

const router = Router();

/** GET / — Health check endpoint */
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

module.exports = router;
