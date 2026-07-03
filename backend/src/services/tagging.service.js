'use strict';

const { v4: uuidv4 } = require('uuid');
const taggingRepository = require('../repositories/tagging.repository');

/**
 * Retrieves all resource tags.
 * @returns {Promise<Array>}
 */
const getAllTags = async () => {
  const result = await taggingRepository.getAll();
  return result.rows.map(formatTag);
};

/**
 * Creates a new resource tag.
 * @param {object} data - Validated tag data
 * @returns {Promise<object>} Created tag
 */
const createTag = async (data) => {
  const tag = { id: uuidv4(), ...data };
  const result = await taggingRepository.insert(tag);
  return formatTag(result.rows[0]);
};

/**
 * Updates an existing resource tag.
 * @param {string} id - Tag UUID
 * @param {object} data - Validated tag data
 * @returns {Promise<object|null>} Updated tag or null
 */
const updateTag = async (id, data) => {
  const result = await taggingRepository.update(id, data);
  if (result.rows.length === 0) return null;
  return formatTag(result.rows[0]);
};

/**
 * Deletes a resource tag by ID.
 * @param {string} id - Tag UUID
 * @returns {Promise<boolean>}
 */
const deleteTag = async (id) => {
  const result = await taggingRepository.remove(id);
  return result.rowCount > 0;
};

/**
 * Calculates tagging compliance percentage.
 * @returns {Promise<{compliancePercentage: number, totalResources: number, compliantResources: number}>}
 */
const getCompliance = async () => {
  const result = await taggingRepository.getComplianceStats();
  const { total_resources, compliant_resources } = result.rows[0];

  const compliancePercentage = total_resources > 0
    ? parseFloat(((compliant_resources / total_resources) * 100).toFixed(1))
    : 0;

  return {
    compliancePercentage,
    totalResources: total_resources,
    compliantResources: compliant_resources,
  };
};

/**
 * Formats a database row to API response format.
 * @param {object} row - Database row
 * @returns {object}
 */
const formatTag = (row) => ({
  id: row.id,
  resourceId: row.resource_id,
  team: row.team,
  project: row.project,
  environment: row.environment,
  aiUseCase: row.ai_use_case,
});

module.exports = { getAllTags, createTag, updateTag, deleteTag, getCompliance };
