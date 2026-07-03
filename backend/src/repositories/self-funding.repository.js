'use strict';

const { query } = require('../config/db');

/**
 * Self-Funding Repository — Queries for AI investment vs savings.
 * Implements HUF08 data access.
 * Uses ai_costs (investment) and recommendations (savings).
 */

/**
 * Get total AI investment (sum of all AI costs).
 * @param {number} months - Number of months to look back (default 12)
 * @returns {Promise<number>} Total investment in USD
 */
const getTotalAiInvestment = async (months = 12) => {
  const sql = `
    SELECT COALESCE(SUM(cost_usd), 0)::NUMERIC(12,2) AS total
    FROM ai_costs
    WHERE cost_date >= CURRENT_DATE - INTERVAL '1 month' * $1
  `;
  const result = await query(sql, [months]);
  return parseFloat(result.rows[0].total);
};

/**
 * Get total savings (realized from implemented recommendations + cost avoidance).
 * @param {number} months - Number of months to look back (default 12)
 * @returns {Promise<number>} Total savings in USD
 */
const getTotalSavings = async (months = 12) => {
  const sql = `
    SELECT COALESCE(SUM(estimated_savings_usd), 0)::NUMERIC(12,2) AS savings
    FROM recommendations
    WHERE status = 'implemented'
      AND implemented_at >= CURRENT_DATE - INTERVAL '1 month' * $1
  `;
  const costAvoidanceSql = `
    SELECT COALESCE(SUM(estimated_savings_usd), 0)::NUMERIC(12,2) AS avoided
    FROM cost_avoidance
    WHERE action_date >= CURRENT_DATE - INTERVAL '1 month' * $1
  `;

  const [recResult, avoidResult] = await Promise.all([
    query(sql, [months]),
    query(costAvoidanceSql, [months]),
  ]);

  return parseFloat(recResult.rows[0].savings) + parseFloat(avoidResult.rows[0].avoided);
};

/**
 * Get current month AI spend.
 * @returns {Promise<number>}
 */
const getCurrentMonthAiSpend = async () => {
  const sql = `
    SELECT COALESCE(SUM(cost_usd), 0)::NUMERIC(12,2) AS total
    FROM ai_costs
    WHERE cost_date >= date_trunc('month', CURRENT_DATE)
  `;
  const result = await query(sql, []);
  return parseFloat(result.rows[0].total);
};

/**
 * Get previous month AI spend.
 * @returns {Promise<number>}
 */
const getPreviousMonthAiSpend = async () => {
  const sql = `
    SELECT COALESCE(SUM(cost_usd), 0)::NUMERIC(12,2) AS total
    FROM ai_costs
    WHERE cost_date >= date_trunc('month', CURRENT_DATE) - INTERVAL '1 month'
      AND cost_date < date_trunc('month', CURRENT_DATE)
  `;
  const result = await query(sql, []);
  return parseFloat(result.rows[0].total);
};

/**
 * Get monthly evolution of investment and savings.
 * @param {number} months - Months to return (default 12)
 * @returns {Promise<Array<{month: string, investmentUsd: number, savingsUsd: number}>>}
 */
const getMonthlyEvolution = async (months = 12) => {
  const sql = `
    SELECT
      to_char(cost_date, 'YYYY-MM') AS month,
      SUM(cost_usd)::NUMERIC(12,2) AS investment_usd
    FROM ai_costs
    WHERE cost_date >= CURRENT_DATE - INTERVAL '1 month' * $1
    GROUP BY to_char(cost_date, 'YYYY-MM')
    ORDER BY month
  `;

  const savingsSql = `
    SELECT
      to_char(implemented_at, 'YYYY-MM') AS month,
      SUM(estimated_savings_usd)::NUMERIC(12,2) AS savings_usd
    FROM recommendations
    WHERE status = 'implemented'
      AND implemented_at >= CURRENT_DATE - INTERVAL '1 month' * $1
    GROUP BY to_char(implemented_at, 'YYYY-MM')
    ORDER BY month
  `;

  const [investResult, savingsResult] = await Promise.all([
    query(sql, [months]),
    query(savingsSql, [months]),
  ]);

  // Merge both datasets
  const investMap = new Map(investResult.rows.map((r) => [r.month, parseFloat(r.investment_usd)]));
  const savingsMap = new Map(savingsResult.rows.map((r) => [r.month, parseFloat(r.savings_usd)]));
  const allMonths = [...new Set([...investMap.keys(), ...savingsMap.keys()])].sort();

  return allMonths.map((month) => ({
    month,
    investmentUsd: investMap.get(month) || 0,
    savingsUsd: savingsMap.get(month) || 0,
    investmentCop: (investMap.get(month) || 0) * 4200,
    savingsCop: (savingsMap.get(month) || 0) * 4200,
  }));
};

module.exports = {
  getTotalAiInvestment,
  getTotalSavings,
  getCurrentMonthAiSpend,
  getPreviousMonthAiSpend,
  getMonthlyEvolution,
};
