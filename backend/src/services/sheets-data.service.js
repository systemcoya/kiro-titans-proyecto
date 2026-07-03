'use strict';

const { readSheet, getSheetNames } = require('../config/google-sheets');

/**
 * In-memory cache for sheet data to avoid repeated API calls.
 * TTL: 5 minutes.
 */
let cache = { data: null, timestamp: 0 };
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Loads all sheets from Google Spreadsheet into memory.
 * Caches for 5 minutes to minimize API calls.
 * @returns {Promise<{infra: Array, ai: Array, otros: Array, polizas: Array}>}
 */
const loadAllData = async () => {
  if (cache.data && Date.now() - cache.timestamp < CACHE_TTL) {
    return cache.data;
  }

  console.log('[sheets-data] Loading data from Google Sheets...');

  const sheetNames = await getSheetNames();
  console.log('[sheets-data] Available sheets:', sheetNames);

  // Read each sheet — names match the Excel tabs
  const infraSheet = await readSheet('Costos de infra');
  const aiSheet = await readSheet('Costos AI');
  const otrosSheet = await readSheet('Otros costos');
  const polizasSheet = await readSheet('Pólizas emitidas');

  const data = {
    infra: infraSheet.rows,
    ai: aiSheet.rows,
    otros: otrosSheet.rows,
    polizas: polizasSheet.rows,
  };

  cache = { data, timestamp: Date.now() };
  console.log(`[sheets-data] Loaded: ${data.infra.length} infra, ${data.ai.length} AI, ${data.otros.length} otros, ${data.polizas.length} polizas`);

  return data;
};

/**
 * Invalidates the cache forcing next call to reload from Sheets.
 */
const invalidateCache = () => {
  cache = { data: null, timestamp: 0 };
};

// =============================================================================
// COMPUTED METRICS
// =============================================================================

/**
 * Gets AI spend breakdown for a given month.
 * @param {string} [mes] - Month filter (YYYY-MM). Defaults to latest.
 * @returns {Promise<{totalCost: number, breakdown: Array, filters: object}>}
 */
const getAISpend = async (mes) => {
  const { ai } = await loadAllData();
  const filtered = mes ? ai.filter((r) => r.Mes === mes) : ai;

  const totalCost = filtered.reduce((s, r) => s + parseFloat(r.Costo_AI_USD || 0), 0);
  const breakdown = filtered.map((r) => ({
    name: r.Servicio_AI || r.Servicio,
    costUsd: parseFloat(r.Costo_AI_USD || 0),
    percentage: totalCost > 0 ? parseFloat(((parseFloat(r.Costo_AI_USD || 0) / totalCost) * 100).toFixed(1)) : 0,
    tokens: parseInt(r.Tokens_Consumidos || 0, 10),
    inferences: parseInt(r.Llamadas_API || 0, 10),
    gpuHours: parseFloat((parseFloat(r.Costo_AI_USD || 0) * 0.01).toFixed(2)),
    groupBy: 'service',
  }));

  return { totalCost, breakdown, filters: { month: mes || 'all' } };
};

/**
 * Gets MegaBill consolidated view.
 * @param {string} [mes] - Month filter
 * @returns {Promise<{totalCost: number, categories: Array}>}
 */
const getMegaBill = async (mes) => {
  const { infra, ai, otros } = await loadAllData();

  const filterByMonth = (arr, field = 'Mes') => mes ? arr.filter((r) => r[field] === mes) : arr;

  const cloudCost = filterByMonth(infra).reduce((s, r) => s + parseFloat(r.Costo_Infraestructura_USD || 0), 0);
  const aiCost = filterByMonth(ai).reduce((s, r) => s + parseFloat(r.Costo_AI_USD || 0), 0);
  const saasCost = filterByMonth(otros).reduce((s, r) => s + parseFloat(r.Costo_Total_USD || 0), 0);
  const totalCost = cloudCost + aiCost + saasCost;

  const categories = [
    { category: 'cloud', totalCost: cloudCost, percentage: totalCost > 0 ? parseFloat(((cloudCost / totalCost) * 100).toFixed(1)) : 0 },
    { category: 'ai', totalCost: aiCost, percentage: totalCost > 0 ? parseFloat(((aiCost / totalCost) * 100).toFixed(1)) : 0 },
    { category: 'saas', totalCost: saasCost, percentage: totalCost > 0 ? parseFloat(((saasCost / totalCost) * 100).toFixed(1)) : 0 },
  ];

  return { totalCost, categories };
};

/**
 * Gets Showback per centro de costos.
 * @param {string} [mes] - Month filter
 * @returns {Promise<{teams: Array, ranking: Array}>}
 */
const getShowback = async (mes) => {
  const { infra, ai, otros, polizas } = await loadAllData();
  const filterMonth = (arr) => mes ? arr.filter((r) => r.Mes === mes) : arr;

  const ccList = ['5100', '5101', '5102', 'General'];
  const budgets = { '5100': 5000, '5101': 4000, '5102': 1500, 'General': null };
  const ccNames = { '5100': 'Autos Verde', '5101': 'Autos Ligeros', '5102': 'Vehículos Pesados', 'General': 'Corporativo' };

  const teams = ccList.map((cc) => {
    const cloudCost = filterMonth(infra).filter((r) => r.Centro_Costos === cc).reduce((s, r) => s + parseFloat(r.Costo_Infraestructura_USD || 0), 0);
    const aiCost = filterMonth(ai).filter((r) => r.Centro_Costos === cc).reduce((s, r) => s + parseFloat(r.Costo_AI_USD || 0), 0);
    const saasCost = filterMonth(otros).filter((r) => r.Centro_Costos === cc).reduce((s, r) => s + parseFloat(r.Costo_Total_USD || 0), 0);
    const totalCost = parseFloat((cloudCost + aiCost + saasCost).toFixed(2));
    const budget = budgets[cc];
    const budgetPercentage = budget ? parseFloat(((totalCost / budget) * 100).toFixed(1)) : null;
    const efficiencyRatio = budget ? parseFloat((totalCost / budget).toFixed(2)) : null;

    return {
      teamName: `${ccNames[cc]} (CC ${cc})`,
      cloudCost, aiCost, saasCost, totalCost,
      budget, budgetPercentage, efficiencyRatio,
      overBudget: budgetPercentage !== null && budgetPercentage > 100,
    };
  });

  const ranking = teams.filter((t) => t.budget !== null).sort((a, b) => (a.efficiencyRatio || 0) - (b.efficiencyRatio || 0));
  return { teams, ranking };
};

/**
 * Gets Unit Economics (cost per policy).
 * @param {string} [mes] - Month filter
 * @returns {Promise<{data: Array, period: object}>}
 */
const getUnitEconomics = async (mes) => {
  const { infra, ai, otros, polizas } = await loadAllData();
  const filterMonth = (arr) => mes ? arr.filter((r) => r.Mes === mes) : arr;

  const polFiltered = filterMonth(polizas);
  const ccList = ['5100', '5101', '5102'];

  const data = ccList.map((cc) => {
    const pol = polFiltered.filter((p) => p.Centro_Costos === cc);
    const totalPolizas = pol.reduce((s, p) => s + parseInt(p.Polizas_Emitidas || 0, 10), 0);
    const totalPrimas = pol.reduce((s, p) => s + parseFloat(p.Primas_Emitidas_USD || 0), 0);

    const cloudCost = filterMonth(infra).filter((r) => r.Centro_Costos === cc).reduce((s, r) => s + parseFloat(r.Costo_Infraestructura_USD || 0), 0);
    const aiCost = filterMonth(ai).filter((r) => r.Centro_Costos === cc).reduce((s, r) => s + parseFloat(r.Costo_AI_USD || 0), 0);
    const saasCost = filterMonth(otros).filter((r) => r.Centro_Costos === cc).reduce((s, r) => s + parseFloat(r.Costo_Total_USD || 0), 0);
    const totalCost = cloudCost + aiCost + saasCost;

    const unitCost = totalPolizas > 0 ? parseFloat((totalCost / totalPolizas).toFixed(4)) : null;
    const producto = pol[0]?.Producto || cc;

    return {
      serviceName: producto,
      useCase: `Cotización ${producto}`,
      totalCostUsd: parseFloat(totalCost.toFixed(2)),
      transactionsProcessed: totalPolizas,
      unitCostUsd: unitCost,
      weeklyTrend: [unitCost, unitCost], // simplified
      trendDirection: 'stable',
    };
  });

  return { data, period: { startDate: mes || '2026-01', endDate: mes || '2026-06' } };
};

/**
 * Gets executive dashboard KPIs.
 * @returns {Promise<object>}
 */
const getExecutiveDashboard = async () => {
  const currentMegaBill = await getMegaBill('2026-06');
  const previousMegaBill = await getMegaBill('2026-05');
  const { polizas } = await loadAllData();

  const currentPolizas = polizas.filter((p) => p.Mes === '2026-06').reduce((s, p) => s + parseInt(p.Polizas_Emitidas || 0, 10), 0);
  const variation = previousMegaBill.totalCost > 0
    ? parseFloat((((currentMegaBill.totalCost - previousMegaBill.totalCost) / previousMegaBill.totalCost) * 100).toFixed(1))
    : null;

  return {
    currentMonthSpend: currentMegaBill.totalCost,
    previousMonthSpend: previousMegaBill.totalCost,
    variationPercentage: variation,
    avgCostPerTransaction: currentPolizas > 0 ? parseFloat((currentMegaBill.totalCost / currentPolizas).toFixed(2)) : 0,
    criticalAlertsCount: 2,
    top5Services: [],
    monthlyTrend: [],
  };
};

module.exports = {
  loadAllData,
  invalidateCache,
  getAISpend,
  getMegaBill,
  getShowback,
  getUnitEconomics,
  getExecutiveDashboard,
};
