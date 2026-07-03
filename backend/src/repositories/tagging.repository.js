'use strict';

const { query } = require('../config/db');

/**
 * Retrieves all resource tags.
 * @returns {Promise<import('pg').QueryResult>}
 */
const getAll = async () => {
  return query('SELECT * FROM resource_tags ORDER BY created_at DESC', []);
};

/**
 * Retrieves a resource tag by ID.
 * @param {string} id - Tag UUID
 * @returns {Promise<import('pg').QueryResult>}
 */
const getById = async (id) => {
  return query('SELECT * FROM resource_tags WHERE id = $1', [id]);
};

/**
 * Inserts a new resource tag.
 * @param {object} tag - Tag data
 * @returns {Promise<import('pg').QueryResult>}
 */
const insert = async (tag) => {
  const sql = `
    INSERT INTO resource_tags (id, resource_id, team, project, environment, ai_use_case)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  return query(sql, [tag.id, tag.resourceId, tag.team, tag.project, tag.environment, tag.aiUseCase]);
};

/**
 * Updates an existing resource tag.
 * @param {string} id - Tag UUID
 * @param {object} data - Updated fields
 * @returns {Promise<import('pg').QueryResult>}
 */
const update = async (id, data) => {
  const sql = `
    UPDATE resource_tags
    SET team = $2, project = $3, environment = $4, ai_use_case = $5, updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;
  return query(sql, [id, data.team, data.project, data.environment, data.aiUseCase]);
};

/**
 * Deletes a resource tag by ID.
 * @param {string} id - Tag UUID
 * @returns {Promise<import('pg').QueryResult>}
 */
const remove = async (id) => {
  return query('DELETE FROM resource_tags WHERE id = $1', [id]);
};

/**
 * Counts total resources and compliant resources (all 4 fields complete).
 * @returns {Promise<import('pg').QueryResult>}
 */
const getComplianceStats = async () => {
  const sql = `
    SELECT
      COUNT(*)::INTEGER AS total_resources,
      COUNT(CASE WHEN team IS NOT NULL AND team != ''
                  AND project IS NOT NULL AND project != ''
                  AND environment IS NOT NULL AND environment != ''
                  AND ai_use_case IS NOT NULL AND ai_use_case != ''
             THEN 1 END)::INTEGER AS compliant_resources
    FROM resource_tags
  `;
  return query(sql, []);
};

module.exports = { getAll, getById, insert, update, remove, getComplianceStats };
