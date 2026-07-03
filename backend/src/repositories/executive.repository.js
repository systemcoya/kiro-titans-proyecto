'use strict';

const { query } = require('../config/db');

/**
 * Executive Repository — Queries for the Executive One-Pager Dashboard.
 * Implements HUF10 data access. Aggregates from multiple tables.
 */

/**
 * Get current month total spend (AI + MegaBill) with optional date filter.
 * @param {string} [month] - ISO month string (e.g., '2026-06'). Defaults to current month.
 * @returns {Promise<number>} Total spend in USD
 */
const getCurrentMonthSpend = async (month) => {
  let sql;
  let params;

  if (month) {
    // Specific month: 2026-06 → 2026-06-01 to 2026-06-30
    const monthDate = `${month}-01`;
    sql = `
      SELECT
        COALESCE((SELECT SUM(cost_usd) FROM ai_costs WHERE cost_date >= $1::date AND cost_date < ($1::date + INTERVAL '1 month')), 0) +
        COALESCE((SELECT SUM(billed_cost) FROM megabill_costs WHERE cost_date >= $1::date AND cost_date < ($1::date + INTERVAL '1 month')), 0)
        AS total_usd
    `;
    params = [monthDate];
  } else {
    // Current month
    sql = `
      SELECT
        COALESCE((SELECT SUM(cost_usd) FROM ai_costs WHERE cost_date >= date_trunc('month', CURRENT_DATE)), 0) +
        COALESCE((SELECT SUM(billed_cost) FROM megabill_costs WHERE cost_date >= date_trunc('month', CURRENT_DATE)), 0)
        AS total_usd
    `;
    params = [];
  }

  const result = await query(sql, params);
  return parseFloat(result.rows[0].total_usd);
};

/**
 * Get previous month total spend with optional filter.
 * @param {string} [month] - ISO month string (e.g., '2026-06'). Defaults to current month.
 * @returns {Promise<number>} Total spend in USD
 */
const getPreviousMonthSpend = async (month) => {
  let sql;
  let params;

  if (month) {
    // Previous month relative to given month
    const monthDate = `${month}-01`;
    sql = `
      SELECT
        COALESCE((SELECT SUM(cost_usd) FROM ai_costs WHERE cost_date >= ($1::date - INTERVAL '1 month') AND cost_date < $1::date), 0) +
        COALESCE((SELECT SUM(billed_cost) FROM megabill_costs WHERE cost_date >= ($1::date - INTERVAL '1 month') AND cost_date < $1::date), 0)
        AS total_usd
    `;
    params = [monthDate];
  } else {
    // Previous month relative to current month
    sql = `
      SELECT
        COALESCE((SELECT SUM(cost_usd) FROM ai_costs WHERE cost_date >= (date_trunc('month', CURRENT_DATE) - INTERVAL '1 month') AND cost_date < date_trunc('month', CURRENT_DATE)), 0) +
        COALESCE((SELECT SUM(billed_cost) FROM megabill_costs WHERE cost_date >= (date_trunc('month', CURRENT_DATE) - INTERVAL '1 month') AND cost_date < date_trunc('month', CURRENT_DATE)), 0)
        AS total_usd
    `;
    params = [];
  }

  const result = await query(sql, params);
  return parseFloat(result.rows[0].total_usd);
};

/**
 * Get top 5 consumers by spend in given month with optional provider/product filters.
 * @param {string} [month] - ISO month string (e.g., '2026-06'). Defaults to current month.
 * @param {string} [provider] - Provider filter (AWS, GCP, etc.)
 * @param {string} [product] - Product filter (e.g., "Autos Verde")
 * @returns {Promise<Array<{name: string, spendCop: number}>>}
 */
const getTop5Consumers = async (month, provider, product) => {
  let monthDate;
  let params = [];
  let paramIndex = 1;
  let providerClause = '';
  let productClause = '';

  if (month) {
    monthDate = `${month}-01`;
    params.push(monthDate);
  } else {
    monthDate = null;
  }

  if (provider) {
    paramIndex++;
    params.push(provider);
    providerClause = `AND provider = $${paramIndex}`;
  }

  if (product) {
    paramIndex++;
    params.push(product);
    productClause = `AND product_line = $${paramIndex}`;
  }

  // Use dynamic date reference based on month param
  const dateCondition = monthDate
    ? `cost_date >= $1::date AND cost_date < ($1::date + INTERVAL '1 month')`
    : `cost_date >= date_trunc('month', CURRENT_DATE) AND cost_date < (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month')`;

  const sql = `
    SELECT name, SUM(spend) * 4200 AS spend_cop FROM (
      SELECT service_name AS name, SUM(cost_usd) AS spend
      FROM ai_costs
      WHERE ${dateCondition}
      ${providerClause} ${productClause}
      GROUP BY service_name
      UNION ALL
      SELECT service_name AS name, SUM(billed_cost) AS spend
      FROM megabill_costs
      WHERE ${dateCondition}
      ${productClause}
      GROUP BY service_name
    ) combined
    GROUP BY name
    ORDER BY SUM(spend) DESC
    LIMIT 5
  `;

  const result = await query(sql, params);
  return result.rows.map((row) => ({
    name: row.name,
    spendCop: parseFloat(row.spend_cop),
  }));
};

/**
 * Get average cost per transaction across all use cases with optional month filter.
 * @param {string} [month] - ISO month string (e.g., '2026-06'). Defaults to current month.
 * @returns {Promise<number>}
 */
const getAverageCostPerTransaction = async (month) => {
  let sql;
  let params;

  if (month) {
    const monthDate = `${month}-01`;
    sql = `
      SELECT
        CASE
          WHEN SUM(transactions_processed) > 0
          THEN (SUM(total_cost_usd) / SUM(transactions_processed))::NUMERIC(12,2)
          ELSE 0
        END AS avg_cost
      FROM unit_economics
      WHERE period_start >= $1::date AND period_start < ($1::date + INTERVAL '1 month')
    `;
    params = [monthDate];
  } else {
    sql = `
      SELECT
        CASE
          WHEN SUM(transactions_processed) > 0
          THEN (SUM(total_cost_usd) / SUM(transactions_processed))::NUMERIC(12,2)
          ELSE 0
        END AS avg_cost
      FROM unit_economics
      WHERE period_start >= date_trunc('month', CURRENT_DATE) AND period_start < (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month')
    `;
    params = [];
  }

  const result = await query(sql, params);
  return parseFloat(result.rows[0].avg_cost) * 4200;
};

/**
 * Get count of currently critical alerts.
 * @returns {Promise<number>}
 */
const getOpenCriticalAlerts = async () => {
  const sql = `
    SELECT COUNT(*)::INTEGER AS count
    FROM alert_rules ar
    CROSS JOIN LATERAL (
      SELECT COALESCE(SUM(cost_usd), 0) AS current_cost
      FROM ai_costs
      WHERE service_name = ar.service
        AND cost_date >= date_trunc('month', CURRENT_DATE)
    ) costs
    WHERE costs.current_cost >= ar.threshold
  `;
  const result = await query(sql, []);
  return parseInt(result.rows[0].count, 10);
};

/**
 * Get self-funding ratio from recommendations and AI costs.
 * @returns {Promise<number>} Ratio as percentage
 */
const getSelfFundingRatio = async () => {
  const investmentSql = `SELECT COALESCE(SUM(cost_usd), 0)::NUMERIC(12,2) AS total FROM ai_costs`;
  const savingsSql = `SELECT COALESCE(SUM(estimated_savings_usd), 0)::NUMERIC(12,2) AS total FROM recommendations WHERE status = 'implemented'`;

  const [investResult, savingsResult] = await Promise.all([
    query(investmentSql, []),
    query(savingsSql, []),
  ]);

  const investment = parseFloat(investResult.rows[0].total);
  const savings = parseFloat(savingsResult.rows[0].total);

  if (investment === 0) return 0;
  return Math.round((savings / investment) * 100 * 100) / 100;
};

module.exports = {
  getCurrentMonthSpend,
  getPreviousMonthSpend,
  getTop5Consumers,
  getAverageCostPerTransaction,
  getOpenCriticalAlerts,
  getSelfFundingRatio,
};
