const express = require('express');
const simulatorController = require('../controllers/simulator.controller');

const router = express.Router();

/**
 * Simulator Routes — HUF06 What-If Cost Projection.
 * All roles can access (viewer, manager, admin).
 */

// POST /api/v1/simulator/project — Calculate cost projection
router.post('/project', simulatorController.project);

module.exports = router;
