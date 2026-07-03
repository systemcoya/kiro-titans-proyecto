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

/**
 * Determines if a team has exceeded its assigned budget.
 * @param {number} totalCost - Total cost in USD for the team.
 * @param {number|null} budget - Assigned budget in USD, or null if not assigned.
 * @returns {{ overBudget: boolean }}
 *   - overBudget: true if totalCost > budget (i.e., budget percentage > 100%), false otherwise.
 *   - If budget is null, undefined, or 0, returns false (cannot exceed a non-existent budget).
 */
const determineBudgetExceeded = (totalCost, budget) => {
  if (budget === null || budget === undefined || budget === 0) {
    return { overBudget: false };
  }

  const percentage = (totalCost / budget) * 100;
  return { overBudget: percentage > 100 };
};

module.exports = {
  calculateBudgetPercentage,
  determineBudgetExceeded
};
