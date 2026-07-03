'use strict';

const megabillRepository = require('../repositories/megabill.repository');

/**
 * Rounds a number to a specified number of decimal places.
 * @param {number} value - Number to round
 * @param {number} decimals - Decimal places
 * @returns {number}
 */
const roundTo = (value, decimals) => {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

/**
 * Calculates percentage distribution ensuring the sum equals 100%.
 * Adjusts the largest category to absorb rounding differences.
 * @param {Array<{category: string, totalCost: number}>} categories - Category totals
 * @param {number} totalCost - Overall total cost
 * @returns {Array<{category: string, totalCost: number, percentage: number}>}
 */
const calculatePercentages = (categories, totalCost) => {
  if (totalCost === 0) {
    return categories.map((cat) => ({ ...cat, percentage: 0 }));
  }

  const withPercentages = categories.map((cat) => ({
    ...cat,
    percentage: roundTo((cat.totalCost / totalCost) * 100, 1),
  }));

  const percentageSum = withPercentages.reduce((sum, cat) => sum + cat.percentage, 0);
  const diff = roundTo(100 - percentageSum, 1);

  if (diff !== 0 && withPercentages.length > 0) {
    const largest = withPercentages.reduce((max, cat) =>
      cat.totalCost > max.totalCost ? cat : max
    );
    largest.percentage = roundTo(largest.percentage + diff, 1);
  }

  return withPercentages;
};

/**
 * Retrieves the MegaBill summary with totals by category and percentage distribution.
 * Returns data for the current month aggregated from the megabill_costs table.
 * @returns {Promise<{totalCost: number, categories: Array<{category: string, totalCost: number, percentage: number}>}>}
 */
const getMegaBill = async () => {
  const rows = await megabillRepository.getTotalsByCategory();

  if (!rows || rows.length === 0) {
    return { totalCost: 0, categories: [] };
  }

  const categories = rows.map((row) => ({
    category: row.category,
    totalCost: roundTo(parseFloat(row.total), 2),
  }));

  const totalCost = roundTo(
    categories.reduce((sum, cat) => sum + cat.totalCost, 0),
    2
  );

  const categoriesWithPercentages = calculatePercentages(categories, totalCost);

  return { totalCost, categories: categoriesWithPercentages };
};

/**
 * Retrieves drill-down details for a specific category.
 * Returns individual service records normalized to FOCUS format.
 * @param {string} category - One of 'cloud', 'saas', 'licenses'
 * @returns {Promise<{category: string, totalCost: number, services: Array<{serviceName: string, billedCost: number, usageQuantity: number, provider: string}>}>}
 */
const getDrillDown = async (category) => {
  const rows = await megabillRepository.getServicesByCategory(category);

  if (!rows || rows.length === 0) {
    return { category, totalCost: 0, services: [] };
  }

  const services = rows.map((row) => ({
    serviceName: row.service_name,
    billedCost: roundTo(parseFloat(row.billed_cost), 2),
    usageQuantity: roundTo(parseFloat(row.usage_quantity), 2),
    provider: row.provider,
  }));

  const totalCost = roundTo(
    services.reduce((sum, svc) => sum + svc.billedCost, 0),
    2
  );

  return { category, totalCost, services };
};

module.exports = { getMegaBill, getDrillDown, calculatePercentages, roundTo };
