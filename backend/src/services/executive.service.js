/**
 * Executive Dashboard Service — One-Pager KPIs logic.
 * Implements Requirements 9.2, 9.3, 9.4, 9.8 (HUF10).
 *
 * Pure calculation functions — no DB dependency.
 */

/**
 * Calculate month-over-month comparison metrics.
 *
 * @param {number} currentMonthSpend - Current month total spend COP
 * @param {number} previousMonthSpend - Previous month total spend COP
 * @returns {{absoluteDiffCop: number, percentVariation: number, trendDirection: 'up' | 'down' | 'stable'}}
 */
const calculateMonthOverMonth = (currentMonthSpend, previousMonthSpend) => {
  const absoluteDiffCop = currentMonthSpend - previousMonthSpend;

  let percentVariation = 0;
  if (previousMonthSpend > 0) {
    percentVariation = ((currentMonthSpend - previousMonthSpend) / previousMonthSpend) * 100;
  }

  let trendDirection = 'stable';
  if (percentVariation > 1) trendDirection = 'up';
  else if (percentVariation < -1) trendDirection = 'down';

  return {
    absoluteDiffCop: Math.round(absoluteDiffCop * 100) / 100,
    percentVariation: Math.round(percentVariation * 100) / 100,
    trendDirection,
  };
};

/**
 * Detect KPI warning — flags when deterioration exceeds 10%.
 *
 * @param {number} currentValue - Current period KPI value
 * @param {number} previousValue - Previous period KPI value
 * @param {'lower_is_better' | 'higher_is_better'} direction - KPI interpretation
 * @returns {boolean} true if KPI shows >10% deterioration
 */
const detectKpiWarning = (currentValue, previousValue, direction) => {
  if (previousValue === 0) return false;

  const percentChange = ((currentValue - previousValue) / previousValue) * 100;

  if (direction === 'lower_is_better') {
    return percentChange > 10;
  }
  return percentChange < -10;
};

/**
 * Sort and limit top-N consumers.
 *
 * @param {Array<{name: string, spendCop: number}>} consumers
 * @param {number} limit - Max items to return (default 5)
 * @returns {Array<{name: string, spendCop: number, rank: number}>}
 */
const getTopConsumers = (consumers, limit = 5) => {
  return consumers
    .sort((a, b) => b.spendCop - a.spendCop)
    .slice(0, limit)
    .map((consumer, index) => ({
      ...consumer,
      rank: index + 1,
    }));
};

/**
 * Build executive summary response.
 *
 * @param {{currentSpend: number, previousSpend: number, topConsumers: Array, avgCostPerTransaction: number, criticalAlerts: number, selfFundingRatio: number}} data
 * @returns {object} Complete executive dashboard response
 */
const buildExecutiveSummary = (data) => {
  const mom = calculateMonthOverMonth(data.currentSpend, data.previousSpend);
  const top5 = getTopConsumers(data.topConsumers, 5);

  const spendWarning = detectKpiWarning(data.currentSpend, data.previousSpend, 'lower_is_better');
  const costPerTxWarning = detectKpiWarning(
    data.avgCostPerTransaction,
    data.previousAvgCostPerTransaction || data.avgCostPerTransaction,
    'lower_is_better'
  );

  return {
    totalSpend: {
      currentMonthCop: data.currentSpend,
      previousMonthCop: data.previousSpend,
      absoluteDiffCop: mom.absoluteDiffCop,
      percentVariation: mom.percentVariation,
      trendDirection: mom.trendDirection,
      hasWarning: spendWarning,
    },
    topConsumers: top5,
    avgCostPerTransaction: {
      value: data.avgCostPerTransaction,
      hasWarning: costPerTxWarning,
    },
    criticalAlertsCount: data.criticalAlerts,
    selfFundingRatio: data.selfFundingRatio,
  };
};

module.exports = {
  calculateMonthOverMonth,
  detectKpiWarning,
  getTopConsumers,
  buildExecutiveSummary,
};
