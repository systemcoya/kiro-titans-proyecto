'use strict';

const { query } = require('../config/db');

/**
 * Alerts Repository — Parameterized queries for alert_rules and alert_history.
 * Implements HUF04 data access.
 */

/**
 * List all active alert rules with current cost comparison.
 * @returns {Promise<Array>} Active alert rules
 */
const listAlerts = async () => {
  const sql = `
    SELECT
      ar.id,
      ar.service,
      ar.threshold,
      ar.recipient,
      ar.created_at,
      ar.updated_at,
      COALESCE(costs.total_cost, 0)::NUMERIC(12,2) AS current_cost,
      CASE
        WHEN COALESCE(costs.total_cost, 0) >= ar.threshold THEN 'critical'
        WHEN COALESCE(costs.total_cost, 0) >= ar.threshold * 0.8 THEN 'warning'
        ELSE 'none'
      END AS severity,
      true AS is_active
    FROM alert_rules ar
    LEFT JOIN (
      SELECT service_name, SUM(cost_usd) AS total_cost
      FROM ai_costs
      WHERE cost_date >= date_trunc('month', CURRENT_DATE)
      GROUP BY service_name
    ) costs ON costs.service_name = ar.service
    ORDER BY ar.created_at DESC
  `;

  const result = await query(sql, []);
  return result.rows.map((row) => ({
    id: row.id,
    serviceId: row.id,
    service: row.service,
    thresholdCop: parseFloat(row.threshold),
    recipientEmail: row.recipient,
    currentCostCop: parseFloat(row.current_cost),
    severity: row.severity,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
};

/**
 * Create a new alert rule.
 * @param {{service: string, threshold: number, recipient: string, userId?: string}} data
 * @returns {Promise<object>} Created alert
 */
const createAlert = async (data) => {
  const sql = `
    INSERT INTO alert_rules (service, threshold, recipient, user_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;

  const result = await query(sql, [data.service, data.threshold, data.recipient, data.userId || null]);
  const row = result.rows[0];
  return {
    id: row.id,
    service: row.service,
    thresholdCop: parseFloat(row.threshold),
    recipientEmail: row.recipient,
    severity: 'none',
    currentCostCop: 0,
    isActive: true,
    createdAt: row.created_at,
  };
};

/**
 * Update an existing alert rule.
 * @param {string} id - Alert rule UUID
 * @param {{threshold?: number, recipient?: string}} data
 * @returns {Promise<object>} Updated alert
 */
const updateAlert = async (id, data) => {
  const fields = [];
  const params = [];
  let paramIndex = 1;

  if (data.threshold !== undefined) {
    fields.push(`threshold = $${paramIndex}`);
    params.push(data.threshold);
    paramIndex++;
  }

  if (data.recipient !== undefined) {
    fields.push(`recipient = $${paramIndex}`);
    params.push(data.recipient);
    paramIndex++;
  }

  fields.push(`updated_at = NOW()`);
  params.push(id);

  const sql = `
    UPDATE alert_rules SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *
  `;

  const result = await query(sql, params);
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    id: row.id,
    service: row.service,
    thresholdCop: parseFloat(row.threshold),
    recipientEmail: row.recipient,
    updatedAt: row.updated_at,
  };
};

/**
 * Delete an alert rule by ID.
 * @param {string} id - Alert rule UUID
 * @returns {Promise<boolean>} True if deleted
 */
const deleteAlert = async (id) => {
  const sql = 'DELETE FROM alert_rules WHERE id = $1';
  const result = await query(sql, [id]);
  return result.rowCount > 0;
};

/**
 * Find active alert by service name (for uniqueness check).
 * @param {string} service - Service name
 * @returns {Promise<object|null>}
 */
const findByService = async (service) => {
  const sql = 'SELECT * FROM alert_rules WHERE service = $1 LIMIT 1';
  const result = await query(sql, [service]);
  return result.rows.length > 0 ? result.rows[0] : null;
};

/**
 * Get alert trigger history.
 * @param {{limit?: number, offset?: number, severity?: string}} filters
 * @returns {Promise<Array>}
 */
const getAlertHistory = async (filters = {}) => {
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  if (filters.severity) {
    conditions.push(`severity = $${paramIndex}`);
    params.push(filters.severity);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = filters.limit || 50;
  const offset = filters.offset || 0;

  params.push(limit, offset);

  const sql = `
    SELECT * FROM alert_history
    ${whereClause}
    ORDER BY triggered_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const result = await query(sql, params);
  return result.rows;
};

module.exports = {
  listAlerts,
  createAlert,
  updateAlert,
  deleteAlert,
  findByService,
  getAlertHistory,
};
