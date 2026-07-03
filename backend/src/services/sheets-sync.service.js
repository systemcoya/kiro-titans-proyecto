'use strict';

const { readSheet, getSheetNames } = require('../config/google-sheets');

/**
 * Sheets Sync Service — Reads data from Google Sheets and transforms it
 * into the format expected by the existing services/repositories.
 *
 * This replaces the static mock/seed.js data with live spreadsheet data.
 */

/**
 * Sync all data from Google Sheets.
 * Returns structured data for each domain entity.
 * @returns {Promise<object>}
 */
const syncAllData = async () => {
  const sheetNames = await getSheetNames();
  console.log('[sheets-sync] Hojas encontradas:', sheetNames);

  const result = {};

  for (const name of sheetNames) {
    try {
      const { headers, rows } = await readSheet(name);
      result[name] = { headers, rows, count: rows.length };
      console.log(`[sheets-sync] ${name}: ${rows.length} registros`);
    } catch (err) {
      console.error(`[sheets-sync] Error leyendo hoja "${name}":`, err.message);
      result[name] = { headers: [], rows: [], count: 0, error: err.message };
    }
  }

  return result;
};

/**
 * Read AI costs data from the spreadsheet.
 * Expects a sheet with columns like: service_name, provider, team, cost_usd, tokens, inferences, gpu_hours, date
 * @param {string} [sheetName='Costos AI'] - Name of the sheet tab
 * @returns {Promise<Array<object>>}
 */
const getAICostsFromSheet = async (sheetName = 'Costos AI') => {
  const { rows } = await readSheet(sheetName);
  return rows.map((row) => ({
    serviceName: row.service_name || row.servicio || row.ServiceName || '',
    provider: row.provider || row.proveedor || row.Provider || '',
    team: row.team || row.equipo || row.Team || '',
    costUsd: parseFloat(row.cost_usd || row.costo_usd || row.CostUSD || 0),
    tokens: parseInt(row.tokens || row.Tokens || 0, 10),
    inferences: parseInt(row.inferences || row.inferencias || row.Inferences || 0, 10),
    gpuHours: parseFloat(row.gpu_hours || row.GPU_Hours || 0),
    costDate: row.cost_date || row.fecha || row.Date || new Date().toISOString().split('T')[0],
  }));
};

/**
 * Read teams/cells data from the spreadsheet.
 * @param {string} [sheetName='Equipos'] - Name of the sheet tab
 * @returns {Promise<Array<object>>}
 */
const getTeamsFromSheet = async (sheetName = 'Equipos') => {
  const { rows } = await readSheet(sheetName);
  return rows.map((row) => ({
    name: row.name || row.nombre || row.Name || '',
    budgetMonthly: parseFloat(row.budget_monthly || row.presupuesto || row.Budget || 0),
    department: row.department || row.departamento || row.Department || '',
  }));
};

/**
 * Read alert rules from the spreadsheet.
 * @param {string} [sheetName='Alertas']
 * @returns {Promise<Array<object>>}
 */
const getAlertsFromSheet = async (sheetName = 'Alertas') => {
  const { rows } = await readSheet(sheetName);
  return rows.map((row) => ({
    service: row.service || row.servicio || '',
    threshold: parseFloat(row.threshold || row.umbral || 0),
    recipient: row.recipient || row.destinatario || row.email || '',
  }));
};

/**
 * Read unit economics data from the spreadsheet.
 * @param {string} [sheetName='Unit Economics']
 * @returns {Promise<Array<object>>}
 */
const getUnitEconomicsFromSheet = async (sheetName = 'Unit Economics') => {
  const { rows } = await readSheet(sheetName);
  return rows.map((row) => ({
    serviceName: row.service_name || row.servicio || '',
    useCase: row.use_case || row.caso_uso || '',
    totalCostUsd: parseFloat(row.total_cost_usd || row.costo_total || 0),
    transactionsProcessed: parseInt(row.transactions_processed || row.transacciones || 0, 10),
    periodStart: row.period_start || row.inicio_periodo || '',
    periodEnd: row.period_end || row.fin_periodo || '',
  }));
};

/**
 * Read MegaBill data from the spreadsheet.
 * @param {string} [sheetName='MegaBill']
 * @returns {Promise<Array<object>>}
 */
const getMegaBillFromSheet = async (sheetName = 'MegaBill') => {
  const { rows } = await readSheet(sheetName);
  return rows.map((row) => ({
    serviceName: row.service_name || row.servicio || '',
    billedCost: parseFloat(row.billed_cost || row.costo || 0),
    usageQuantity: parseFloat(row.usage_quantity || row.cantidad_uso || 0),
    provider: row.provider || row.proveedor || '',
    category: row.category || row.categoria || 'cloud',
    costDate: row.cost_date || row.fecha || '',
  }));
};

module.exports = {
  syncAllData,
  getAICostsFromSheet,
  getTeamsFromSheet,
  getAlertsFromSheet,
  getUnitEconomicsFromSheet,
  getMegaBillFromSheet,
};
