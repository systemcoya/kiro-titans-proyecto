'use strict';

const { readSheet, getSheetNames } = require('../config/google-sheets');

/**
 * Sheets Sync Service — Reads REAL data from the team's Google Sheets.
 *
 * Sheet structure:
 * - "Costos AI": Mes, Proveedor, Servicio_AI, Centro_Costos, Producto, Llamadas_API, Tokens_Consumidos, Costo_AI_USD, Aplicacion
 * - "Costos de infra": Mes, Proveedor, Servicio, Costo_Infraestructura_USD, Aplicacion, Producto, Centro_Costos
 * - "Otros costos": Mes, Proveedor/Plataforma, Concepto_Gasto, Centro_Costos, Producto, Unidad_Medida, Consumo_Cantidad, Costo_Total_USD, Aplicacion
 * - "Pólizas emitidas": Mes, Producto, Centro_Costos, Polizas_Emitidas, Primas_Emitidas_USD
 */

/**
 * Sync all sheets and return structured data.
 * @returns {Promise<object>}
 */
const syncAllData = async () => {
  const [aiCosts, infraCosts, otherCosts, policies] = await Promise.all([
    getAICosts(),
    getInfraCosts(),
    getOtherCosts(),
    getPoliciesEmitted(),
  ]);

  return {
    aiCosts,
    infraCosts,
    otherCosts,
    policies,
    syncedAt: new Date().toISOString(),
  };
};

/**
 * Get AI costs from "Costos AI" sheet.
 * @returns {Promise<Array<object>>}
 */
const getAICosts = async () => {
  const { rows } = await readSheet('Costos AI');
  return rows.map((row) => ({
    mes: row.Mes,
    proveedor: row.Proveedor,
    servicioAI: row.Servicio_AI,
    centroCostos: row.Centro_Costos,
    producto: row.Producto,
    llamadasApi: parseInt(row.Llamadas_API || 0, 10),
    tokensConsumidos: parseInt(row.Tokens_Consumidos || 0, 10),
    costoAiUsd: parseFloat(row.Costo_AI_USD || 0),
    aplicacion: row.Aplicacion,
  }));
};

/**
 * Get infrastructure costs from "Costos de infra" sheet.
 * @returns {Promise<Array<object>>}
 */
const getInfraCosts = async () => {
  const { rows } = await readSheet('Costos de infra');
  return rows.map((row) => ({
    mes: row.Mes,
    proveedor: row.Proveedor,
    servicio: row.Servicio,
    costoInfraUsd: parseFloat(row.Costo_Infraestructura_USD || 0),
    aplicacion: row.Aplicacion,
    producto: row.Producto,
    centroCostos: row.Centro_Costos,
  }));
};

/**
 * Get other costs (SaaS, licenses) from "Otros costos" sheet.
 * @returns {Promise<Array<object>>}
 */
const getOtherCosts = async () => {
  const { rows } = await readSheet('Otros costos');
  return rows.map((row) => ({
    mes: row.Mes,
    proveedor: row['Proveedor/Plataforma'],
    conceptoGasto: row.Concepto_Gasto,
    centroCostos: row.Centro_Costos,
    producto: row.Producto,
    unidadMedida: row.Unidad_Medida,
    consumoCantidad: parseInt(row.Consumo_Cantidad || 0, 10),
    costoTotalUsd: parseFloat(row.Costo_Total_USD || 0),
    aplicacion: row.Aplicacion,
  }));
};

/**
 * Get policies emitted from "Pólizas emitidas" sheet.
 * Used for Unit Economics calculations (transactions = pólizas).
 * @returns {Promise<Array<object>>}
 */
const getPoliciesEmitted = async () => {
  const { rows } = await readSheet('Pólizas emitidas');
  return rows.map((row) => ({
    mes: row.Mes,
    producto: row.Producto,
    centroCostos: row.Centro_Costos,
    polizasEmitidas: parseInt(row.Polizas_Emitidas || 0, 10),
    primasEmitidasUsd: parseFloat(row.Primas_Emitidas_USD || 0),
  }));
};

/**
 * Get consolidated MegaBill view (AI + Infra + Other costs).
 * @returns {Promise<Array<object>>}
 */
const getMegaBillConsolidated = async () => {
  const [ai, infra, other] = await Promise.all([getAICosts(), getInfraCosts(), getOtherCosts()]);

  const megabill = [];

  for (const row of ai) {
    megabill.push({
      mes: row.mes,
      serviceName: row.servicioAI,
      provider: row.proveedor,
      category: 'ai',
      billedCostUsd: row.costoAiUsd,
      producto: row.producto,
      centroCostos: row.centroCostos,
    });
  }

  for (const row of infra) {
    megabill.push({
      mes: row.mes,
      serviceName: row.servicio,
      provider: row.proveedor,
      category: 'cloud',
      billedCostUsd: row.costoInfraUsd,
      producto: row.producto,
      centroCostos: row.centroCostos,
    });
  }

  for (const row of other) {
    megabill.push({
      mes: row.mes,
      serviceName: row.conceptoGasto,
      provider: row.proveedor,
      category: 'saas',
      billedCostUsd: row.costoTotalUsd,
      producto: row.producto,
      centroCostos: row.centroCostos,
    });
  }

  return megabill;
};

/**
 * Get Unit Economics: cost per policy emitted per product.
 * @returns {Promise<Array<object>>}
 */
const getUnitEconomics = async () => {
  const [aiCosts, policies] = await Promise.all([getAICosts(), getPoliciesEmitted()]);

  // Group AI costs by month+product
  const costsByKey = {};
  for (const row of aiCosts) {
    const key = `${row.mes}|${row.producto}`;
    if (!costsByKey[key]) costsByKey[key] = 0;
    costsByKey[key] += row.costoAiUsd;
  }

  // Join with policies
  return policies.map((pol) => {
    const key = `${pol.mes}|${pol.producto}`;
    const totalCostUsd = costsByKey[key] || 0;
    const unitCost = pol.polizasEmitidas > 0
      ? parseFloat((totalCostUsd / pol.polizasEmitidas).toFixed(4))
      : null;

    return {
      mes: pol.mes,
      producto: pol.producto,
      totalCostAiUsd: totalCostUsd,
      polizasEmitidas: pol.polizasEmitidas,
      primasEmitidasUsd: pol.primasEmitidasUsd,
      costoPorPolizaUsd: unitCost,
      costoPorPolizaCop: unitCost !== null ? Math.round(unitCost * 4200) : null,
    };
  });
};

module.exports = {
  syncAllData,
  getAICosts,
  getInfraCosts,
  getOtherCosts,
  getPoliciesEmitted,
  getMegaBillConsolidated,
  getUnitEconomics,
};
