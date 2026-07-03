'use strict';

const { query } = require('../config/db');

/**
 * Retrieves unit economics data for a given date range.
 * Returns aggregated cost and transaction counts per service/use case.
 * @param {string} startDate - ISO-8601 start date
 * @param {string} endDate - ISO-8601 end date
 * @returns {Promise<import('pg').QueryResult>} Unit economics rows
 */
const getUnitEconomicsByPeriod = async (startDate, endDate) => {
  const sql = `
    SELECT
      service_name,
      use_case,
      SUM(total_cost_usd)::NUMERIC(12,2) AS total_cost_usd,
      SUM(transactions_processed)::INTEGER AS transactions_processed
    FROM unit_economics
    WHERE period_start >= $1 AND period_end <= $2
    GROUP BY service_name, use_case
    ORDER BY service_name, use_case
  `;

  return query(sql, [startDate, endDate]);
};

/**
 * Retrieves weekly unit costs for the last 8 weeks per use case.
 * Used for sparkline trend calculation.
 * @param {string} referenceDate - The end date reference point (ISO-8601)
 * @returns {Promise<import('pg').QueryResult>} Weekly cost rows per use case
 */
const getWeeklyTrend = async (referenceDate) => {
  const sql = `
    WITH weeks AS (
      SELECT
        service_name,
        use_case,
        DATE_TRUNC('week', period_start) AS week_start,
        SUM(total_cost_usd)::NUMERIC(12,2) AS weekly_cost,
        SUM(transactions_processed)::INTEGER AS weekly_transactions
      FROM unit_economics
      WHERE period_start >= ($1::DATE - INTERVAL '8 weeks')
        AND period_start < $1::DATE
      GROUP BY service_name, use_case, DATE_TRUNC('week', period_start)
      ORDER BY service_name, use_case, week_start
    )
    SELECT
      service_name,
      use_case,
      week_start,
      weekly_cost,
      weekly_transactions
    FROM weeks
    ORDER BY service_name, use_case, week_start ASC
  `;

  return query(sql, [referenceDate]);
};

module.exports = {
  getUnitEconomicsByPeriod,
  getWeeklyTrend,
};
