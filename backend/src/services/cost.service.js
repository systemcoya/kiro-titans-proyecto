'use strict';

const { v4: uuidv4 } = require('uuid');
const costRepository = require('../repositories/cost.repository');

/**
 * Retrieves AI spend data with breakdown, percentages, and consumption metrics.
 * @param {object} filters - Validated cost filters
 * @param {string} filters.startDate - ISO-8601 start date
 * @param {string} filters.endDate - ISO-8601 end date
 * @param {string} [filters.team] - Optional team name filter
 * @param {string} [filters.provider] - Optional provider filter
 * @param {'service'|'team'|'provider'} filters.groupBy - Grouping dimension
 * @returns {Promise<{totalCost: number, breakdown: Array, filters: object}>}
 */
const getAISpend = async (filters) => {
  const { startDate, endDate, team, provider, groupBy } = filters;

  const result = await costRepository.getAISpendGrouped({
    startDate,
    endDate,
    groupBy,
    team,
    provider,
  });

  const rows = result.rows;

  const totalCost = rows.reduce(
    (sum, row) => sum + parseFloat(row.cost_usd),
    0
  );

  const breakdown = rows.map((row) => {
    const costUsd = parseFloat(row.cost_usd);
    const percentage = totalCost > 0
      ? parseFloat(((costUsd / totalCost) * 100).toFixed(2))
      : 0;

    const item = {
      name: row.name,
      costUsd,
      percentage,
      groupBy,
    };

    if (row.tokens !== null && row.tokens !== undefined) {
      item.tokens = parseInt(row.tokens, 10);
    }
    if (row.inferences !== null && row.inferences !== undefined) {
      item.inferences = parseInt(row.inferences, 10);
    }
    if (row.gpu_hours !== null && row.gpu_hours !== undefined) {
      item.gpuHours = parseFloat(row.gpu_hours);
    }

    return item;
  });

  return {
    totalCost: parseFloat(totalCost.toFixed(2)),
    breakdown,
    filters: { startDate, endDate, team, provider, groupBy },
  };
};

/**
 * Generates new mock AI cost records simulating +1 hour of consumption.
 * Creates one record per service with realistic random variation based on historical averages.
 * @returns {Promise<{recordsCreated: number, simulatedTime: string, records: Array}>}
 */
const advanceTime = async () => {
  const profilesResult = await costRepository.getServiceProfiles();
  const teamsResult = await costRepository.getTeamIds();

  const profiles = profilesResult.rows;
  const teamIds = teamsResult.rows.map((row) => row.id);

  if (profiles.length === 0 || teamIds.length === 0) {
    return { recordsCreated: 0, simulatedTime: new Date().toISOString(), records: [] };
  }

  const records = [];
  const costDate = new Date().toISOString().split('T')[0];

  for (const profile of profiles) {
    const hourlyFraction = 1 / 24;
    const variation = 0.7 + Math.random() * 0.6;

    const costUsd = parseFloat(
      (parseFloat(profile.avg_cost) * hourlyFraction * variation).toFixed(2)
    );
    const tokens = profile.avg_tokens
      ? Math.round(parseInt(profile.avg_tokens, 10) * hourlyFraction * variation)
      : 0;
    const inferences = profile.avg_inferences
      ? Math.round(parseInt(profile.avg_inferences, 10) * hourlyFraction * variation)
      : 0;
    const gpuHours = profile.avg_gpu_hours
      ? parseFloat((parseFloat(profile.avg_gpu_hours) * hourlyFraction * variation).toFixed(2))
      : 0;

    const teamId = teamIds[Math.floor(Math.random() * teamIds.length)];

    const record = {
      id: uuidv4(),
      serviceName: profile.service_name,
      provider: profile.provider,
      teamId,
      costUsd,
      tokens,
      inferences,
      gpuHours,
      costDate,
    };

    await costRepository.insertAICost(record);
    records.push(record);
  }

  return {
    recordsCreated: records.length,
    simulatedTime: new Date().toISOString(),
    records,
  };
};

module.exports = {
  getAISpend,
  advanceTime,
};
