'use strict';

const { query } = require('../config/db');

/**
 * Retrieves all teams with their budget information.
 * @returns {Promise<import('pg').QueryResult>} Team rows with id, name, budget_monthly, department
 */
const getAllTeams = async () => {
  const sql = `
    SELECT id, name, budget_monthly, department
    FROM teams
    ORDER BY name
  `;
  return query(sql, []);
};

/**
 * Retrieves AI costs aggregated by team for a specific month.
 * @param {string} monthStart - First day of the month (YYYY-MM-DD)
 * @param {string} monthEnd - First day of the next month (YYYY-MM-DD)
 * @returns {Promise<import('pg').QueryResult>} Rows with team_id and total ai_cost
 */
const getAICostsByTeam = async (monthStart, monthEnd) => {
  const sql = `
    SELECT
      team_id,
      COALESCE(SUM(cost_usd), 0)::NUMERIC(12,2) AS ai_cost
    FROM ai_costs
    WHERE cost_date >= $1 AND cost_date < $2
    GROUP BY team_id
  `;
  return query(sql, [monthStart, monthEnd]);
};

/**
 * Retrieves megabill costs aggregated by category for a specific month.
 * @param {string} monthStart - First day of the month (YYYY-MM-DD)
 * @param {string} monthEnd - First day of the next month (YYYY-MM-DD)
 * @returns {Promise<import('pg').QueryResult>} Rows with category and total cost
 */
const getMegabillCostsByCategory = async (monthStart, monthEnd) => {
  const sql = `
    SELECT
      category,
      COALESCE(SUM(billed_cost), 0)::NUMERIC(12,2) AS total_cost
    FROM megabill_costs
    WHERE cost_date >= $1 AND cost_date < $2
    GROUP BY category
  `;
  return query(sql, [monthStart, monthEnd]);
};

module.exports = {
  getAllTeams,
  getAICostsByTeam,
  getMegabillCostsByCategory,
};
