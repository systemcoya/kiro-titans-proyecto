'use strict';

const { v4: uuidv4 } = require('uuid');
const costAvoidanceRepository = require('../repositories/cost-avoidance.repository');

/**
 * Gets month boundaries from an optional YYYY-MM string.
 * @param {string} [month] - Month in YYYY-MM format. Defaults to current month.
 * @returns {{ monthStart: string, monthEnd: string }}
 */
const getMonthBoundaries = (month) => {
  let year, monthNum;
  if (month) {
    const parts = month.split('-');
    year = parseInt(parts[0], 10);
    monthNum = parseInt(parts[1], 10) - 1;
  } else {
    const now = new Date();
    year = now.getFullYear();
    monthNum = now.getMonth();
  }
  const start = new Date(Date.UTC(year, monthNum, 1));
  const end = new Date(Date.UTC(year, monthNum + 1, 1));
  return {
    monthStart: start.toISOString().split('T')[0],
    monthEnd: end.toISOString().split('T')[0],
  };
};

/**
 * Retrieves cost avoidance report for a given month.
 * @param {string} [month] - Optional month in YYYY-MM format
 * @returns {Promise<{actions: Array, totalSavings: number}>}
 */
const getReport = async (month) => {
  const { monthStart, monthEnd } = getMonthBoundaries(month);

  const [actionsResult, totalResult] = await Promise.all([
    costAvoidanceRepository.getByMonth(monthStart, monthEnd),
    costAvoidanceRepository.getTotalSavings(monthStart, monthEnd),
  ]);

  const actions = actionsResult.rows.map((row) => ({
    id: row.id,
    resource: row.resource,
    actionType: row.action_type,
    date: row.action_date.toISOString ? row.action_date.toISOString().split('T')[0] : row.action_date,
    estimatedSavingsUsd: parseFloat(row.estimated_savings_usd),
  }));

  const totalSavings = parseFloat(totalResult.rows[0].total);

  return { actions, totalSavings };
};

/**
 * Creates a new cost avoidance action.
 * @param {object} data - Validated action data
 * @returns {Promise<object>} Created action
 */
const createAction = async (data) => {
  const action = { id: uuidv4(), ...data };
  const result = await costAvoidanceRepository.insert(action);
  const row = result.rows[0];
  return {
    id: row.id,
    resource: row.resource,
    actionType: row.action_type,
    date: row.action_date,
    estimatedSavingsUsd: parseFloat(row.estimated_savings_usd),
  };
};

module.exports = { getReport, createAction, getMonthBoundaries };
