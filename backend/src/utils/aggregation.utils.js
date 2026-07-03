/**
 * Aggregation utility functions for cost totals.
 * Implements Property 5: Aggregated totals equal sum of components.
 *
 * Uses integer arithmetic (cents) to avoid floating-point precision issues.
 */

/**
 * Converts a USD amount to integer cents for safe arithmetic.
 * @param {number} amount - Dollar amount (e.g., 123.45)
 * @returns {number} Integer cents (e.g., 12345)
 */
const toCents = (amount) => Math.round(amount * 100);

/**
 * Converts integer cents back to a USD amount with 2 decimal places.
 * @param {number} cents - Integer cents
 * @returns {number} Dollar amount rounded to 2 decimals
 */
const fromCents = (cents) => Math.round(cents) / 100;

/**
 * Calculates the total showback cost for a team from its cost components.
 * totalCost = cloudCost + aiCost + saasCost (exact arithmetic via cents).
 *
 * Validates: Requirement 3.1
 *
 * @param {number} cloudCost - Cloud infrastructure cost in USD
 * @param {number} aiCost - AI services cost in USD
 * @param {number} saasCost - SaaS cost in USD
 * @returns {number} Total cost in USD (2 decimal places)
 */
const calculateShowbackTotal = (cloudCost, aiCost, saasCost) => {
  const totalCents = toCents(cloudCost) + toCents(aiCost) + toCents(saasCost);
  return fromCents(totalCents);
};

/**
 * Calculates the total estimated savings from a list of active recommendations.
 * totalSavings = sum of all individual estimatedSavingsUsd values.
 *
 * Validates: Requirement 7.5
 *
 * @param {Array<{ estimatedSavingsUsd: number }>} recommendations - Active recommendations
 * @returns {number} Total estimated savings in USD (2 decimal places)
 */
const calculateTotalEstimatedSavings = (recommendations) => {
  if (!Array.isArray(recommendations) || recommendations.length === 0) {
    return 0;
  }

  const totalCents = recommendations.reduce(
    (sum, rec) => sum + toCents(rec.estimatedSavingsUsd),
    0
  );

  return fromCents(totalCents);
};

/**
 * Calculates the monthly cost avoidance total from a list of preventive actions.
 * monthlyTotal = sum of all individual estimatedSavingsUsd values for actions in the month.
 *
 * Validates: Requirement 9.2
 *
 * @param {Array<{ estimatedSavingsUsd: number }>} actions - Cost avoidance actions in a month
 * @returns {number} Monthly cost avoidance total in USD (2 decimal places)
 */
const calculateMonthlyCostAvoidance = (actions) => {
  if (!Array.isArray(actions) || actions.length === 0) {
    return 0;
  }

  const totalCents = actions.reduce(
    (sum, action) => sum + toCents(action.estimatedSavingsUsd),
    0
  );

  return fromCents(totalCents);
};

module.exports = {
  toCents,
  fromCents,
  calculateShowbackTotal,
  calculateTotalEstimatedSavings,
  calculateMonthlyCostAvoidance
};
