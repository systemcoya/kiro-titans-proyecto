'use strict';

const { query } = require('../config/db');

/**
 * Retrieves cost avoidance actions for a specific month.
 * @param {string} monthStart - First day of month (YYYY-MM-DD)
 * @param {string} monthEnd - First day of next month (YYYY-MM-DD)
 * @returns {Promise<import('pg').QueryResult>}
 */
const getByMonth = async (monthStart, monthEnd) => {
  const sql = `
    SELECT id, resource, action_type, action_date, estimated_savings_usd, created_at
    FROM cost_avoidance
    WHERE action_date >= $1 AND action_date < $2
    ORDER BY action_date DESC
  `;
  return query(sql, [monthStart, monthEnd]);
};

/**
 * Retrieves total savings for a specific month.
 * @param {string} monthStart - First day of month (YYYY-MM-DD)
 * @param {string} monthEnd - First day of next month (YYYY-MM-DD)
 * @returns {Promise<import('pg').QueryResult>}
 */
const getTotalSavings = async (monthStart, monthEnd) => {
  const sql = `
    SELECT COALESCE(SUM(estimated_savings_usd), 0)::NUMERIC(12,2) AS total
    FROM cost_avoidance
    WHERE action_date >= $1 AND action_date < $2
  `;
  return query(sql, [monthStart, monthEnd]);
};

/**
 * Inserts a new cost avoidance action.
 * @param {object} action - Action data
 * @param {string} action.id - UUID
 * @param {string} action.resource - Resource name (max 100)
 * @param {string} action.actionType - One of allowed types
 * @param {string} action.date - ISO-8601 date
 * @param {number} action.estimatedSavingsUsd - Savings amount
 * @returns {Promise<import('pg').QueryResult>}
 */
const insert = async (action) => {
  const sql = `
    INSERT INTO cost_avoidance (id, resource, action_type, action_date, estimated_savings_usd)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  return query(sql, [action.id, action.resource, action.actionType, action.date, action.estimatedSavingsUsd]);
};

module.exports = { getByMonth, getTotalSavings, insert };
