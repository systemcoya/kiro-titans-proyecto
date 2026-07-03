'use strict';

const { query } = require('../config/db');

/**
 * Simulator Repository — Queries for What-If Cost Projection.
 * Implements HUF06 data access.
 */

/**
 * Get current monthly costs per service for projection baseline.
 * Uses the most recent month's data as baseline.
 * @param {Array<string>} serviceNames - Service names to query
 * @returns {Promise<Array<{serviceName: string, monthlyCostCop: number, monthlyCostUsd: number}>>}
 */
const getCurrentMonthlyCosts = async (serviceNames) => {
  if (!serviceNames || serviceNames.length === 0) return [];

  const placeholders = serviceNames.map((_, i) => `$${i + 1}`).join(', ');

  const sql = `
    SELECT
      service_name,
      SUM(cost_usd)::NUMERIC(12,2) AS monthly_cost_usd
    FROM ai_costs
    WHERE service_name IN (${placeholders})
      AND cost_date >= date_trunc('month', CURRENT_DATE)
    GROUP BY service_name
  `;

  const result = await query(sql, serviceNames);
  return result.rows.map((row) => ({
    serviceName: row.service_name,
    monthlyCostUsd: parseFloat(row.monthly_cost_usd),
    monthlyCostCop: parseFloat(row.monthly_cost_usd) * 4200,
  }));
};

/**
 * Get average monthly cost per service over the last N months.
 * Useful as a more stable baseline for projections.
 * @param {Array<string>} serviceNames
 * @param {number} months - Number of months to average (default 3)
 * @returns {Promise<Array<{serviceName: string, avgMonthlyCostUsd: number}>>}
 */
const getAverageMonthlyCosts = async (serviceNames, months = 3) => {
  if (!serviceNames || serviceNames.length === 0) return [];

  const placeholders = serviceNames.map((_, i) => `$${i + 1}`).join(', ');

  const sql = `
    SELECT
      service_name,
      (SUM(cost_usd) / $${serviceNames.length + 1})::NUMERIC(12,2) AS avg_monthly_cost_usd
    FROM ai_costs
    WHERE service_name IN (${placeholders})
      AND cost_date >= CURRENT_DATE - INTERVAL '1 month' * $${serviceNames.length + 1}
    GROUP BY service_name
  `;

  const result = await query(sql, [...serviceNames, months]);
  return result.rows.map((row) => ({
    serviceName: row.service_name,
    avgMonthlyCostUsd: parseFloat(row.avg_monthly_cost_usd),
  }));
};

/**
 * Get all available services for the simulator dropdown.
 * @returns {Promise<Array<{serviceName: string, provider: string}>>}
 */
const getAvailableServices = async () => {
  const sql = `
    SELECT DISTINCT service_name, provider
    FROM ai_costs
    ORDER BY service_name
  `;
  const result = await query(sql, []);
  return result.rows.map((row) => ({
    serviceName: row.service_name,
    provider: row.provider,
  }));
};

module.exports = {
  getCurrentMonthlyCosts,
  getAverageMonthlyCosts,
  getAvailableServices,
};
