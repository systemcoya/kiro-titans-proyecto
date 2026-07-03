const express = require('express');
const selfFundingController = require('../controllers/self-funding.controller');

const router = express.Router();

/**
 * Self-Funding Routes — HUF08 AI Investment vs Savings.
 * All roles can access (viewer, manager, admin).
 */

// GET /api/v1/self-funding — Dashboard overview
router.get('/', selfFundingController.getDashboard);

// GET /api/v1/self-funding/timeline — Monthly evolution (12 months)
router.get('/timeline', selfFundingController.getTimeline);

module.exports = router;
