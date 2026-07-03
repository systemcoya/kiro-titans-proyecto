const express = require('express');
const sheetsSyncService = require('../services/sheets-sync.service');

const router = express.Router();

/**
 * Google Sheets Data Routes — Live data from the team's spreadsheet.
 * All endpoints read directly from Google Sheets (no DB needed).
 */

// GET /api/v1/sheets/sync — Full sync: all sheets consolidated
router.get('/sync', async (req, res, next) => {
  try {
    const data = await sheetsSyncService.syncAllData();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/sheets/ai-costs — AI costs from "Costos AI"
router.get('/ai-costs', async (req, res, next) => {
  try {
    const data = await sheetsSyncService.getAICosts();
    res.json({ data, count: data.length });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/sheets/infra-costs — Infrastructure costs from "Costos de infra"
router.get('/infra-costs', async (req, res, next) => {
  try {
    const data = await sheetsSyncService.getInfraCosts();
    res.json({ data, count: data.length });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/sheets/other-costs — SaaS/licenses from "Otros costos"
router.get('/other-costs', async (req, res, next) => {
  try {
    const data = await sheetsSyncService.getOtherCosts();
    res.json({ data, count: data.length });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/sheets/policies — Policies emitted from "Pólizas emitidas"
router.get('/policies', async (req, res, next) => {
  try {
    const data = await sheetsSyncService.getPoliciesEmitted();
    res.json({ data, count: data.length });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/sheets/megabill — Consolidated MegaBill (AI + Infra + Others)
router.get('/megabill', async (req, res, next) => {
  try {
    const data = await sheetsSyncService.getMegaBillConsolidated();
    res.json({ data, count: data.length });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/sheets/unit-economics — Cost per policy emitted
router.get('/unit-economics', async (req, res, next) => {
  try {
    const data = await sheetsSyncService.getUnitEconomics();
    res.json({ data, count: data.length });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
