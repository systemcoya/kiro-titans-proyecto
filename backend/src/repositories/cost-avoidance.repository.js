'use strict';

const { query } = require('../config/db');

/**
 * Cost Avoidance Repository — Queries for cost_avoidance table.
 * Task 12.1 data access.
 */

/**
 * List cost avoidance records with optional date filter.
 * @param {{startDate?: string, endDate?: string, limit?: number, offset?: number}} filters
 * @returns {Promise<Array>}
 */
const listAvoidanceRecords = async (filters = {}) => {
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  if (filters.startDate) {
    conditions.push(`action_date >= $${paramIndex}`);
    params.push(filters.startDate);
    paramIndex++;
  }
  if (filters.endDate) {
    conditions.push(`action_date <= $${paramIndex}`);
    params.push(filters.endDate);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = filters.limit || 50;
  const offset = filters.offset || 0;
  params.push(limit, offset);

  const sql = `
    SELECT * FROM cost_avoidance
    ${whereClause}
    ORDER BY action_date DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const result = await query(sql, params);
  return result.rows.map((row) => ({
    id: row.id,
    resource: row.resource,
    actionType: row.action_type,
    actionDate: row.action_date,
    estimatedSavingsUsd: parseFloat(row.estimated_savings_usd),
    createdAt: row.created_at,
  }));
};

/**
 * Create a cost avoidance record.
 * @param {{resource: string, actionType: string, actionDate: string, estimatedSavingsUsd: number}} data
 * @returns {Promise<object>}
 */
const createAvoidanceRecord = async (data) => {
  const sql = `
    INSERT INTO cost_avoidance (resource, action_type, action_date, estimated_savings_usd)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  const result = await query(sql, [data.resource, data.actionType, data.actionDate, data.estimatedSavingsUsd]);
  return result.rows[0];
};

/**
 * Get total avoidance for current month.
 * @returns {Promise<number>}
 */
const getCurrentMonthTotal = async () => {
  const sql = `
    SELECT COALESCE(SUM(estimated_savings_usd), 0)::NUMERIC(12,2) AS total
    FROM cost_avoidance
    WHERE action_date >= date_trunc('month', CURRENT_DATE)
  `;
  const result = await query(sql, []);
  return parseFloat(result.rows[0].total);
};

module.exports = {
  listAvoidanceRecords,
  createAvoidanceRecord,
  getCurrentMonthTotal,
};
