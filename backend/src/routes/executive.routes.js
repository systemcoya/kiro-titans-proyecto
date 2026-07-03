const express = require('express');
const executiveController = require('../controllers/executive.controller');

const router = express.Router();

/**
 * Executive Routes — HUF10 Executive One-Pager Dashboard.
 * All roles can access (viewer, manager, admin).
 */

// GET /api/v1/executive/dashboard — Executive dashboard with optional filters
// Query params: ?month=2026-06&provider=AWS&product=Autos%20Verde
router.get('/dashboard', executiveController.getDashboard);

// GET /api/v1/executive/summary — Legacy endpoint for backward compatibility
router.get('/summary', executiveController.getSummary);

module.exports = router;
