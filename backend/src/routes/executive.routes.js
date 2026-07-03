const express = require('express');
const executiveController = require('../controllers/executive.controller');

const router = express.Router();

/**
 * Executive Routes — HUF10 Executive One-Pager Dashboard.
 * All roles can access (viewer, manager, admin).
 */

// GET /api/v1/executive/summary — Complete executive dashboard
router.get('/summary', executiveController.getSummary);

module.exports = router;
