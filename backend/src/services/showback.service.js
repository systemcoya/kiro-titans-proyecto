/**
 * Showback/Chargeback service.
 * Handles budget percentage calculations and efficiency ranking for teams.
 */

/**
 * Calculates the budget percentage for a team.
 * @param {number} totalCost - Total cost in USD for the team.
 * @param {number|null} budget - Assigned budget in USD, or null if not assigned.
 * @returns {{ budgetPercentage: number|null, excludeFromRanking: boolean }}
 *   - budgetPercentage: (totalCost / budget) × 100 rounded to 1 decimal, or null if no budget.
 *   - excludeFromRanking: true if team should be excluded from efficiency ranking.
 */
const calculateBudgetPercentage = (totalCost, budget) => {
  if (budget === null || budget === undefined || budget === 0) {
    return {
      budgetPercentage: null,
      excludeFromRanking: true
    };
  }

  const percentage = (totalCost / budget) * 100;
  const rounded = Math.round(percentage * 10) / 10;

  return {
    budgetPercentage: rounded,
    excludeFromRanking: false
  };
};

module.exports = {
  calculateBudgetPercentage
};
