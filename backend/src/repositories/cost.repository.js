'use strict';

const { query } = require('../config/db');

/**
 * Retrieves AI spend data grouped by a specified dimension, filtered by date range, team, and provider.
 * @param {object} params - Query parameters
 * @param {string} params.startDate - ISO-8601 start date
 * @param {string} params.endDate - ISO-8601 end date
 * @param {'service'|'team'|'provider'} params.groupBy - Grouping dimension
 * @param {string} [params.team] - Optional team name filter
 * @param {string} [params.provider] - Optional provider filter
 * @returns {Promise<import('pg').QueryResult>} Aggregated cost rows
 */
const getAISpendGrouped = async ({ startDate, endDate, groupBy, team, provider }) => {
  const conditions = ['ac.cost_date >= $1', 'ac.cost_date <= $2'];
  const params = [startDate, endDate];
  let paramIndex = 3;

  if (team) {
    conditions.push(`t.name = $${paramIndex}`);
    params.push(team);
    paramIndex++;
  }

  if (provider) {
    conditions.push(`ac.provider = $${paramIndex}`);
    params.push(provider);
    paramIndex++;
  }

  let groupColumn;
  let nameExpression;

  switch (groupBy) {
    case 'team':
      groupColumn = 't.name';
      nameExpression = 't.name';
      break;
    case 'provider':
      groupColumn = 'ac.provider';
      nameExpression = 'ac.provider';
      break;
    case 'service':
    default:
      groupColumn = 'ac.service_name';
      nameExpression = 'ac.service_name';
      break;
  }

  const sql = `
    SELECT
      ${nameExpression} AS name,
      SUM(ac.cost_usd)::NUMERIC(12,2) AS cost_usd,
      SUM(ac.tokens)::INTEGER AS tokens,
      SUM(ac.inferences)::INTEGER AS inferences,
      SUM(ac.gpu_hours)::NUMERIC(8,2) AS gpu_hours
    FROM ai_costs ac
    JOIN teams t ON ac.team_id = t.id
    WHERE ${conditions.join(' AND ')}
    GROUP BY ${groupColumn}
    ORDER BY cost_usd DESC
  `;

  return query(sql, params);
};

/**
 * Retrieves all distinct AI service profiles for temporal advance generation.
 * @returns {Promise<import('pg').QueryResult>} Service profile rows
 */
const getServiceProfiles = async () => {
  const sql = `
    SELECT DISTINCT
      service_name,
      provider,
      AVG(cost_usd)::NUMERIC(12,2) AS avg_cost,
      AVG(tokens)::INTEGER AS avg_tokens,
      AVG(inferences)::INTEGER AS avg_inferences,
      AVG(gpu_hours)::NUMERIC(8,2) AS avg_gpu_hours
    FROM ai_costs
    GROUP BY service_name, provider
  `;

  return query(sql, []);
};

/**
 * Retrieves all team IDs for random assignment during temporal advance.
 * @returns {Promise<import('pg').QueryResult>} Team ID rows
 */
const getTeamIds = async () => {
  const sql = 'SELECT id FROM teams';
  return query(sql, []);
};

/**
 * Inserts a new AI cost record (used by temporal advance).
 * @param {object} record - Cost record to insert
 * @param {string} record.id - UUID for the record
 * @param {string} record.serviceName - Service name
 * @param {string} record.provider - Provider name
 * @param {string} record.teamId - Team UUID
 * @param {number} record.costUsd - Cost in USD
 * @param {number} record.tokens - Token count
 * @param {number} record.inferences - Inference count
 * @param {number} record.gpuHours - GPU hours
 * @param {string} record.costDate - ISO-8601 date
 * @returns {Promise<import('pg').QueryResult>}
 */
const insertAICost = async (record) => {
  const sql = `
    INSERT INTO ai_costs (id, service_name, provider, team_id, cost_usd, tokens, inferences, gpu_hours, cost_date)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `;

  return query(sql, [
    record.id,
    record.serviceName,
    record.provider,
    record.teamId,
    record.costUsd,
    record.tokens,
    record.inferences,
    record.gpuHours,
    record.costDate,
  ]);
};

module.exports = {
  getAISpendGrouped,
  getServiceProfiles,
  getTeamIds,
  insertAICost,
};
