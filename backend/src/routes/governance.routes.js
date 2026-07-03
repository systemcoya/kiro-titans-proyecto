const express = require('express');
const governanceController = require('../controllers/governance.controller');

const router = express.Router();

/**
 * Governance Routes — HUF07 Governance Policies Engine.
 * RBAC: GET = viewer+, POST/PUT/PATCH = manager+, DELETE = admin only.
 */

// Policies
router.get('/policies', governanceController.listPolicies);
router.post('/policies', governanceController.createPolicy);
router.put('/policies/:id', governanceController.updatePolicy);
router.delete('/policies/:id', governanceController.deletePolicy);

// Recommendations
router.get('/recommendations', governanceController.listRecommendations);
router.patch('/recommendations/:id/accept', governanceController.acceptRecommendation);
router.patch('/recommendations/:id/dismiss', governanceController.dismissRecommendation);

module.exports = router;
