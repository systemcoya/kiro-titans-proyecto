const express = require('express');
const costAvoidanceController = require('../controllers/cost-avoidance.controller');

const router = express.Router();

/**
 * Cost Avoidance Routes — Task 12.1
 */
router.get('/', costAvoidanceController.listAvoidance);
router.post('/', costAvoidanceController.createAvoidance);
router.get('/trend', costAvoidanceController.getTrend);

module.exports = router;
