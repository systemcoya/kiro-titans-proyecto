/**
 * Self-Funding Service — AI Investment vs Savings logic.
 * Implements Requirements 7.2, 7.3, 7.4 (HUF08).
 *
 * Pure calculation functions — no DB dependency.
 */

/**
 * Calculate the Self-Funding Ratio.
 * Formula: (totalSavings / totalAiInvestment) × 100
 *
 * @param {number} totalSavings - Total savings identified in COP
 * @param {number} totalAiInvestment - Total AI investment in COP
 * @returns {{ratio: number, isSelfFunded: boolean, label: string}}
 */
const calculateSelfFundingRatio = (totalSavings, totalAiInvestment) => {
  if (totalAiInvestment <= 0) {
    return {
      ratio: 0,
      isSelfFunded: false,
      label: 'Sin inversión AI registrada',
    };
  }

  const ratio = (totalSavings / totalAiInvestment) * 100;
  const roundedRatio = Math.round(ratio * 100) / 100;

  return {
    ratio: roundedRatio,
    isSelfFunded: roundedRatio >= 100,
    label: `AI autofinanciada al ${roundedRatio.toFixed(1)}%`,
  };
};

/**
 * Determine trend direction comparing current vs previous period.
 *
 * @param {number} currentValue - Current period value
 * @param {number} previousValue - Previous period value
 * @returns {'up' | 'down' | 'stable'}
 */
const calculateTrend = (currentValue, previousValue) => {
  if (previousValue === 0 && currentValue === 0) return 'stable';
  if (previousValue === 0 && currentValue > 0) return 'up';

  const percentChange = ((currentValue - previousValue) / previousValue) * 100;

  if (percentChange > 1) return 'up';
  if (percentChange < -1) return 'down';
  return 'stable';
};

/**
 * Build the self-funding dashboard response.
 *
 * @param {{totalAiInvestment: number, totalSavings: number, previousRatio: number}} data
 * @returns {{investment: number, savings: number, ratio: number, isSelfFunded: boolean, label: string, trend: string}}
 */
const buildSelfFundingDashboard = (data) => {
  const { ratio, isSelfFunded, label } = calculateSelfFundingRatio(
    data.totalSavings,
    data.totalAiInvestment
  );

  const trend = calculateTrend(ratio, data.previousRatio || 0);

  return {
    investment: data.totalAiInvestment,
    savings: data.totalSavings,
    ratio,
    isSelfFunded,
    label,
    trend,
  };
};

module.exports = {
  calculateSelfFundingRatio,
  calculateTrend,
  buildSelfFundingDashboard,
};
