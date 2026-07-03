/**
 * Simulator Service — What-If Cost Projection logic.
 * Implements Requirements 8.1, 8.2, 8.7 (HUF06).
 *
 * Pure calculation functions — no DB dependency.
 * Repository will be plugged in when schema is ready.
 */

const CONFIDENCE_BANDS = {
  optimistic: -15,
  base: 0,
  pessimistic: 25,
};

const PROJECTION_INTERVALS = [1, 3, 6];

/**
 * Calculate projected cost for a single service at a given interval.
 * Formula: currentCost × (1 + rate/100)^months
 *
 * @param {number} currentMonthlyCost - Current monthly cost in COP
 * @param {number} percentIncrement - Growth rate percentage (e.g., 30 for 30%)
 * @param {number} months - Number of months to project
 * @returns {number} Projected cost in COP
 */
const projectCost = (currentMonthlyCost, percentIncrement, months) => {
  if (currentMonthlyCost <= 0) return 0;
  const rate = percentIncrement / 100;
  return currentMonthlyCost * Math.pow(1 + rate, months);
};

/**
 * Calculate projection with confidence bands for a single interval.
 *
 * @param {number} currentMonthlyCost - Baseline monthly cost
 * @param {number} percentIncrement - User-provided growth rate
 * @param {number} months - Projection interval
 * @param {number} exchangeRate - USD to COP rate
 * @returns {{optimistic: {totalCop: number, totalUsd: number}, base: {totalCop: number, totalUsd: number}, pessimistic: {totalCop: number, totalUsd: number}}}
 */
const calculateConfidenceBands = (currentMonthlyCost, percentIncrement, months, exchangeRate) => {
  const result = {};

  for (const [band, adjustment] of Object.entries(CONFIDENCE_BANDS)) {
    const adjustedRate = percentIncrement + adjustment;
    const totalCop = projectCost(currentMonthlyCost, adjustedRate, months);
    const totalUsd = exchangeRate > 0 ? totalCop / exchangeRate : 0;

    result[band] = {
      totalCop: Math.round(totalCop * 100) / 100,
      totalUsd: Math.round(totalUsd * 100) / 100,
    };
  }

  return result;
};

/**
 * Generate full projection for multiple services across all intervals.
 *
 * @param {Array<{serviceId: string, currentMonthlyCostCop: number, percentIncrement: number}>} serviceData
 * @param {number} exchangeRate - USD to COP exchange rate
 * @returns {{intervals: Array<{months: number, optimistic: object, base: object, pessimistic: object}>}}
 */
const generateProjection = (serviceData, exchangeRate) => {
  const intervals = PROJECTION_INTERVALS.map((months) => {
    const bandTotals = { optimistic: 0, base: 0, pessimistic: 0 };

    for (const service of serviceData) {
      const bands = calculateConfidenceBands(
        service.currentMonthlyCostCop,
        service.percentIncrement,
        months,
        exchangeRate
      );

      bandTotals.optimistic += bands.optimistic.totalCop;
      bandTotals.base += bands.base.totalCop;
      bandTotals.pessimistic += bands.pessimistic.totalCop;
    }

    return {
      months,
      optimistic: {
        totalCop: Math.round(bandTotals.optimistic * 100) / 100,
        totalUsd: exchangeRate > 0 ? Math.round((bandTotals.optimistic / exchangeRate) * 100) / 100 : 0,
      },
      base: {
        totalCop: Math.round(bandTotals.base * 100) / 100,
        totalUsd: exchangeRate > 0 ? Math.round((bandTotals.base / exchangeRate) * 100) / 100 : 0,
      },
      pessimistic: {
        totalCop: Math.round(bandTotals.pessimistic * 100) / 100,
        totalUsd: exchangeRate > 0 ? Math.round((bandTotals.pessimistic / exchangeRate) * 100) / 100 : 0,
      },
    };
  });

  return { intervals };
};

module.exports = {
  projectCost,
  calculateConfidenceBands,
  generateProjection,
  CONFIDENCE_BANDS,
  PROJECTION_INTERVALS,
};
