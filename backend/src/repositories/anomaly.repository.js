'use strict';

const { query } = require('../config/db');

/**
 * Retrieves the latest daily cost stats with 28-day statistics for anomaly detection.
 * Only includes services with at least 28 days of data.
 * @returns {Promise<import('pg').QueryResult>}
 */
const getLatestStatsWithBaseline = async () => {
  const sql = `
    WITH latest_per_service AS (
      SELECT DISTINCT ON (service_name)
        service_name,
        stat_date,
        daily_cost,
        mean_28d,
        stddev_28d
      FROM daily_cost_stats
      WHERE mean_28d IS NOT NULL AND stddev_28d IS NOT NULL
      ORDER BY service_name, stat_date DESC
    ),
    data_days AS (
      SELECT service_name, COUNT(*)::INTEGER AS days_count
      FROM daily_cost_stats
      GROUP BY service_name
    )
    SELECT
      l.service_name,
      l.stat_date,
      l.daily_cost,
      l.mean_28d,
      l.stddev_28d,
      d.days_count
    FROM latest_per_service l
    JOIN data_days d ON d.service_name = l.service_name
    WHERE d.days_count >= 28
    ORDER BY l.service_name
  `;
  return query(sql, []);
};

module.exports = { getLatestStatsWithBaseline };
