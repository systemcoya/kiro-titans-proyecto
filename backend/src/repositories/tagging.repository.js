'use strict';

const { query } = require('../config/db');

/**
 * Tagging Repository — Queries for resource_tags table.
 * Task 14.1 data access.
 */

/**
 * List all resource tags.
 * @param {{limit?: number, offset?: number}} filters
 * @returns {Promise<Array>}
 */
const listTags = async (filters = {}) => {
  const limit = filters.limit || 50;
  const offset = filters.offset || 0;

  const sql = `
    SELECT * FROM resource_tags
    ORDER BY updated_at DESC
    LIMIT $1 OFFSET $2
  `;
  const result = await query(sql, [limit, offset]);
  return result.rows.map((row) => ({
    id: row.id,
    resourceId: row.resource_id,
    team: row.team,
    project: row.project,
    environment: row.environment,
    aiUseCase: row.ai_use_case,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
};

/**
 * Get tags for a specific resource.
 * @param {string} resourceId
 * @returns {Promise<object|null>}
 */
const getByResourceId = async (resourceId) => {
  const sql = 'SELECT * FROM resource_tags WHERE resource_id = $1';
  const result = await query(sql, [resourceId]);
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    id: row.id,
    resourceId: row.resource_id,
    team: row.team,
    project: row.project,
    environment: row.environment,
    aiUseCase: row.ai_use_case,
  };
};

/**
 * Create or update tags for a resource (upsert).
 * @param {{resourceId: string, team?: string, project?: string, environment?: string, aiUseCase?: string}} data
 * @returns {Promise<object>}
 */
const upsertTags = async (data) => {
  const sql = `
    INSERT INTO resource_tags (resource_id, team, project, environment, ai_use_case, updated_at)
    VALUES ($1, $2, $3, $4, $5, NOW())
    ON CONFLICT (resource_id) DO UPDATE SET
      team = COALESCE($2, resource_tags.team),
      project = COALESCE($3, resource_tags.project),
      environment = COALESCE($4, resource_tags.environment),
      ai_use_case = COALESCE($5, resource_tags.ai_use_case),
      updated_at = NOW()
    RETURNING *
  `;
  const result = await query(sql, [data.resourceId, data.team, data.project, data.environment, data.aiUseCase]);
  return result.rows[0];
};

/**
 * Get compliance summary (count of resources with/without required tags).
 * @returns {Promise<Array>}
 */
const getComplianceSummary = async () => {
  const sql = `
    SELECT
      resource_id,
      team,
      project,
      environment
    FROM resource_tags
  `;
  const result = await query(sql, []);
  return result.rows.map((row) => ({
    resourceId: row.resource_id,
    team: row.team,
    project: row.project,
    environment: row.environment,
  }));
};

module.exports = {
  listTags,
  getByResourceId,
  upsertTags,
  getComplianceSummary,
};
