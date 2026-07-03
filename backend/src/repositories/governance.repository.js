'use strict';

const { query } = require('../config/db');

/**
 * Governance Repository — Parameterized queries for governance_rules and recommendations.
 * Implements HUF07 data access.
 */

/**
 * List all governance rules/policies.
 * @returns {Promise<Array>}
 */
const listPolicies = async () => {
  const sql = `
    SELECT * FROM governance_rules ORDER BY created_at DESC
  `;
  const result = await query(sql, []);
  return result.rows.map((row) => ({
    id: row.id,
    resource: row.resource,
    metric: row.metric,
    operator: row.operator,
    value: parseFloat(row.value),
    evaluationPeriodDays: row.evaluation_period_days,
    isActive: row.is_active,
    createdAt: row.created_at,
  }));
};

/**
 * Create a new governance rule.
 * @param {{resource: string, metric: string, operator: string, value: number, evaluationPeriodDays: number}} data
 * @returns {Promise<object>}
 */
const createPolicy = async (data) => {
  const sql = `
    INSERT INTO governance_rules (resource, metric, operator, value, evaluation_period_days)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const result = await query(sql, [data.resource, data.metric, data.operator, data.value, data.evaluationPeriodDays]);
  return result.rows[0];
};

/**
 * Update a governance rule.
 * @param {string} id
 * @param {object} data
 * @returns {Promise<object|null>}
 */
const updatePolicy = async (id, data) => {
  const fields = [];
  const params = [];
  let paramIndex = 1;

  if (data.resource !== undefined) { fields.push(`resource = $${paramIndex}`); params.push(data.resource); paramIndex++; }
  if (data.metric !== undefined) { fields.push(`metric = $${paramIndex}`); params.push(data.metric); paramIndex++; }
  if (data.operator !== undefined) { fields.push(`operator = $${paramIndex}`); params.push(data.operator); paramIndex++; }
  if (data.value !== undefined) { fields.push(`value = $${paramIndex}`); params.push(data.value); paramIndex++; }
  if (data.evaluationPeriodDays !== undefined) { fields.push(`evaluation_period_days = $${paramIndex}`); params.push(data.evaluationPeriodDays); paramIndex++; }
  if (data.isActive !== undefined) { fields.push(`is_active = $${paramIndex}`); params.push(data.isActive); paramIndex++; }

  if (fields.length === 0) return null;

  params.push(id);
  const sql = `UPDATE governance_rules SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const result = await query(sql, params);
  return result.rows.length > 0 ? result.rows[0] : null;
};

/**
 * Delete a governance rule.
 * @param {string} id
 * @returns {Promise<boolean>}
 */
const deletePolicy = async (id) => {
  const sql = 'DELETE FROM governance_rules WHERE id = $1';
  const result = await query(sql, [id]);
  return result.rowCount > 0;
};

/**
 * List recommendations with optional status filter.
 * @param {{status?: string, limit?: number, offset?: number}} filters
 * @returns {Promise<Array>}
 */
const listRecommendations = async (filters = {}) => {
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  if (filters.status) {
    conditions.push(`status = $${paramIndex}`);
    params.push(filters.status);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = filters.limit || 50;
  const offset = filters.offset || 0;
  params.push(limit, offset);

  const sql = `
    SELECT * FROM recommendations
    ${whereClause}
    ORDER BY estimated_savings_usd DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const result = await query(sql, params);
  return result.rows.map((row) => ({
    id: row.id,
    ruleId: row.rule_id,
    resourceId: row.resource_id,
    ruleName: row.rule_name,
    estimatedSavingCop: parseFloat(row.estimated_savings_usd) * 4200,
    estimatedSavingUsd: parseFloat(row.estimated_savings_usd),
    suggestedAction: row.suggested_action,
    status: row.status,
    createdAt: row.created_at,
    implementedAt: row.implemented_at,
  }));
};

/**
 * Get a single recommendation by ID.
 * @param {string} id
 * @returns {Promise<object|null>}
 */
const getRecommendation = async (id) => {
  const sql = 'SELECT * FROM recommendations WHERE id = $1';
  const result = await query(sql, [id]);
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    id: row.id,
    status: row.status,
    estimatedSavingCop: parseFloat(row.estimated_savings_usd) * 4200,
  };
};

/**
 * Update recommendation status (accept/dismiss).
 * @param {string} id
 * @param {string} status - 'implemented' (accepted)
 * @returns {Promise<object|null>}
 */
const updateRecommendationStatus = async (id, status) => {
  const implementedAt = status === 'implemented' ? 'NOW()' : 'NULL';
  const sql = `
    UPDATE recommendations SET status = $1, implemented_at = ${implementedAt} WHERE id = $2 RETURNING *
  `;
  const result = await query(sql, [status, id]);
  return result.rows.length > 0 ? result.rows[0] : null;
};

/**
 * Get total savings from active recommendations.
 * @returns {Promise<number>}
 */
const getTotalActiveSavings = async () => {
  const sql = `SELECT COALESCE(SUM(estimated_savings_usd), 0)::NUMERIC(12,2) AS total FROM recommendations WHERE status = 'active'`;
  const result = await query(sql, []);
  return parseFloat(result.rows[0].total);
};

/**
 * Get total realized savings (implemented recommendations).
 * @returns {Promise<number>}
 */
const getTotalRealizedSavings = async () => {
  const sql = `SELECT COALESCE(SUM(estimated_savings_usd), 0)::NUMERIC(12,2) AS total FROM recommendations WHERE status = 'implemented'`;
  const result = await query(sql, []);
  return parseFloat(result.rows[0].total);
};

module.exports = {
  listPolicies,
  createPolicy,
  updatePolicy,
  deletePolicy,
  listRecommendations,
  getRecommendation,
  updateRecommendationStatus,
  getTotalActiveSavings,
  getTotalRealizedSavings,
};
