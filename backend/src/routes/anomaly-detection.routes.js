const express = require('express');
const anomalyController = require('../controllers/anomaly-detection.controller');

const router = express.Router();

/**
 * Anomaly Detection Routes — Task 15.1
 */
router.get('/', anomalyController.getAnomalies);
router.get('/service/:serviceName', anomalyController.getServiceAnomalies);

module.exports = router;
