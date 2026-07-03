const express = require('express');
const sheetsSyncService = require('../services/sheets-sync.service');

const router = express.Router();

/**
 * Google Sheets Sync Routes.
 * Allows manual trigger of data sync and inspection of available sheets.
 */

// GET /api/v1/sheets/sync — Sync all data from Google Sheets
router.get('/sync', async (req, res, next) => {
  try {
    const data = await sheetsSyncService.syncAllData();
    res.json({
      message: 'Sincronización completada',
      sheets: data,
      syncedAt: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/sheets/ai-costs — Read AI costs from sheet
router.get('/ai-costs', async (req, res, next) => {
  try {
    const sheetName = req.query.sheet || 'Costos AI';
    const data = await sheetsSyncService.getAICostsFromSheet(sheetName);
    res.json({ data, count: data.length, source: sheetName });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/sheets/teams — Read teams from sheet
router.get('/teams', async (req, res, next) => {
  try {
    const sheetName = req.query.sheet || 'Equipos';
    const data = await sheetsSyncService.getTeamsFromSheet(sheetName);
    res.json({ data, count: data.length, source: sheetName });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/sheets/megabill — Read MegaBill data from sheet
router.get('/megabill', async (req, res, next) => {
  try {
    const sheetName = req.query.sheet || 'MegaBill';
    const data = await sheetsSyncService.getMegaBillFromSheet(sheetName);
    res.json({ data, count: data.length, source: sheetName });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
