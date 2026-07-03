'use strict';

const unitEconomicsRepository = require('../repositories/unit-economics.repository');

/**
 * Calculates unit cost rounded to 4 decimal places.
 * Returns null if transactions is 0.
 * @param {number} totalCost - Total cost in USD
 * @param {number} transactions - Number of transactions processed
 * @returns {number|null} Unit cost or null
 */
const calculateUnitCost = (totalCost, transactions) => {
  if (transactions === 0) {
    return null;
  }
  return parseFloat((totalCost / transactions).toFixed(4));
};

/**
 * Determines trend direction by comparing current vs. previous week unit cost.
 * Returns null if current week has 0 transactions.
 * @param {number|null} currentUnitCost - Current week unit cost (null if 0 transactions)
 * @param {number|null} previousUnitCost - Previous week unit cost (null if 0 transactions)
 * @returns {'up'|'down'|'stable'|null} Trend direction
 */
const determineTrendDirection = (currentUnitCost, previousUnitCost) => {
  if (currentUnitCost === null) {
    return null;
  }
  if (previousUnitCost === null) {
    return 'stable';
  }
  if (currentUnitCost > previousUnitCost) {
    return 'up';
  }
  if (currentUnitCost < previousUnitCost) {
    return 'down';
  }
  return 'stable';
};

/**
 * Resolves the date range for a given period parameter.
 * @param {object} params - Validated query params
 * @param {string} [params.period] - Preset period (week|month)
 * @param {string} [params.startDate] - Custom start date
 * @param {string} [params.endDate] - Custom end date
 * @returns {{ startDate: string, endDate: string }}
 */
const resolveDateRange = (params) => {
  if (params.startDate && params.endDate) {
    return { startDate: params.startDate, endDate: params.endDate };
  }

  const now = new Date();
  let startDate;
  let endDate;

  if (params.period === 'week') {
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate = new Date(now);
    startDate.setDate(now.getDate() - diffToMonday);
    endDate = new Date(now);
  } else {
    // month
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now);
  }

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
};

/**
 * Builds weekly trend array (last 8 weeks of unit costs) for a specific use case.
 * @param {Array<{week_start: string, weekly_cost: string, weekly_transactions: string}>} weeklyRows - Rows for a single use case
 * @returns {number[]} Array of up to 8 unit costs (most recent last)
 */
const buildWeeklyTrend = (weeklyRows) => {
  return weeklyRows.map((row) => {
    const cost = parseFloat(row.weekly_cost);
    const transactions = parseInt(row.weekly_transactions, 10);
    return calculateUnitCost(cost, transactions);
  });
};

/**
 * Retrieves unit economics data for the specified period.
 * Calculates cost/transaction per use case, weekly trends, and trend direction.
 * @param {object} params - Validated query parameters
 * @param {string} [params.period] - Preset period (week|month)
 * @param {string} [params.startDate] - Custom start date
 * @param {string} [params.endDate] - Custom end date
 * @returns {Promise<{data: Array, period: {startDate: string, endDate: string}}>}
 */
const getUnitEconomics = async (params) => {
  const { startDate, endDate } = resolveDateRange(params);

  const [economicsResult, trendResult] = await Promise.all([
    unitEconomicsRepository.getUnitEconomicsByPeriod(startDate, endDate),
    unitEconomicsRepository.getWeeklyTrend(endDate),
  ]);

  // Group weekly trend data by use_case
  const trendsByUseCase = {};
  for (const row of trendResult.rows) {
    const key = `${row.service_name}|${row.use_case}`;
    if (!trendsByUseCase[key]) {
      trendsByUseCase[key] = [];
    }
    trendsByUseCase[key].push(row);
  }

  const data = economicsResult.rows.map((row) => {
    const totalCostUsd = parseFloat(row.total_cost_usd);
    const transactionsProcessed = parseInt(row.transactions_processed, 10);
    const unitCostUsd = calculateUnitCost(totalCostUsd, transactionsProcessed);

    const key = `${row.service_name}|${row.use_case}`;
    const weeklyRows = trendsByUseCase[key] || [];
    const weeklyTrend = buildWeeklyTrend(weeklyRows);

    // Determine trend direction from last 2 values of weekly trend
    let trendDirection = null;
    if (weeklyTrend.length >= 2) {
      const currentWeek = weeklyTrend[weeklyTrend.length - 1];
      const previousWeek = weeklyTrend[weeklyTrend.length - 2];
      trendDirection = determineTrendDirection(currentWeek, previousWeek);
    } else if (weeklyTrend.length === 1) {
      trendDirection = determineTrendDirection(weeklyTrend[0], null);
    }

    return {
      serviceName: row.service_name,
      useCase: row.use_case,
      totalCostUsd,
      transactionsProcessed,
      unitCostUsd,
      weeklyTrend,
      trendDirection,
    };
  });

  return {
    data,
    period: { startDate, endDate },
  };
};

module.exports = {
  getUnitEconomics,
  calculateUnitCost,
  determineTrendDirection,
  resolveDateRange,
  buildWeeklyTrend,
};
