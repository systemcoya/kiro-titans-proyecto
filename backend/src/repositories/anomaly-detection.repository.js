'use strict';

const { query } = require('../config/db');

/**
 * Anomaly Detection Repository — Queries for daily_cost_stats.
 * Task 15.1 data access.
 */

/**
 * Get latest daily stats with pre-computed mean and stddev.
 * @param {number} days - Number of days to look back (default 7)
 * @returns {Promise<Array>}
 */
const getRecentStats = async (days = 7) => {
  const sql = `
    SELECT service_name, stat_date, daily_cost, mean_28d, stddev_28d
    FROM daily_cost_stats
    WHERE stat_date >= CURRENT_DATE - INTERVAL '1 day' * $1
      AND mean_28d IS NOT NULL
      AND stddev_28d IS NOT NULL
    ORDER BY stat_date DESC, service_name
  `;
  const result = await query(sql, [days]);
  return result.rows.map((row) => ({
    serviceName: row.service_name,
    statDate: row.stat_date,
    dailyCost: parseFloat(row.daily_cost),
    mean28d: parseFloat(row.mean_28d),
    stddev28d: parseFloat(row.stddev_28d),
  }));
};

/**
 * Get stats for a specific service.
 * @param {string} serviceName
 * @param {number} days
 * @returns {Promise<Array>}
 */
const getStatsByService = async (serviceName, days = 30) => {
  const sql = `
    SELECT service_name, stat_date, daily_cost, mean_28d, stddev_28d
    FROM daily_cost_stats
    WHERE service_name = $1
      AND stat_date >= CURRENT_DATE - INTERVAL '1 day' * $2
    ORDER BY stat_date DESC
  `;
  const result = await query(sql, [serviceName, days]);
  return result.rows.map((row) => ({
    serviceName: row.service_name,
    statDate: row.stat_date,
    dailyCost: parseFloat(row.daily_cost),
    mean28d: row.mean_28d ? parseFloat(row.mean_28d) : null,
    stddev28d: row.stddev_28d ? parseFloat(row.stddev_28d) : null,
  }));
};

module.exports = {
  getRecentStats,
  getStatsByService,
};
