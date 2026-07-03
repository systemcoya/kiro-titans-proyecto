'use strict';

const showbackRepository = require('../repositories/showback.repository');

/**
 * Calculates the start and end dates for a given month string.
 * @param {string} [month] - Month in YYYY-MM or YYYY-MM-DD format. Defaults to current month.
 * @returns {{monthStart: string, monthEnd: string}} ISO date strings for month boundaries
 */
const getMonthBoundaries = (month) => {
  let year;
  let monthNum;

  if (month) {
    const parts = month.split('-');
    year = parseInt(parts[0], 10);
    monthNum = parseInt(parts[1], 10) - 1;
  } else {
    const now = new Date();
    year = now.getFullYear();
    monthNum = now.getMonth();
  }

  const startDate = new Date(Date.UTC(year, monthNum, 1));
  const endDate = new Date(Date.UTC(year, monthNum + 1, 1));

  const monthStart = startDate.toISOString().split('T')[0];
  const monthEnd = endDate.toISOString().split('T')[0];

  return { monthStart, monthEnd };
};

/**
 * Distributes a total cost proportionally across teams based on their AI cost weight.
 * Teams with zero AI cost receive zero share of the distributed cost.
 * @param {number} totalCost - Total cost to distribute
 * @param {Map<string, number>} aiCostsByTeam - Map of teamId to AI cost
 * @param {string[]} teamIds - All team IDs to distribute across
 * @returns {Map<string, number>} Map of teamId to their proportional share
 */
const distributeCostProportionally = (totalCost, aiCostsByTeam, teamIds) => {
  const distribution = new Map();

  if (totalCost === 0) {
    teamIds.forEach((id) => distribution.set(id, 0));
    return distribution;
  }

  const totalAICost = Array.from(aiCostsByTeam.values()).reduce((sum, cost) => sum + cost, 0);

  if (totalAICost === 0) {
    // Distribute evenly if no AI costs exist
    const share = totalCost / teamIds.length;
    teamIds.forEach((id) => distribution.set(id, share));
    return distribution;
  }

  teamIds.forEach((id) => {
    const teamAICost = aiCostsByTeam.get(id) || 0;
    const weight = teamAICost / totalAICost;
    distribution.set(id, totalCost * weight);
  });

  return distribution;
};

/**
 * Retrieves the showback breakdown for a given month.
 * Returns per-team cost breakdown (cloud, AI, SaaS, total), budget percentage,
 * efficiency ratio, overBudget flag, and a ranking of teams with budgets.
 *
 * @param {string} [month] - Optional month filter in YYYY-MM or YYYY-MM-DD format
 * @returns {Promise<{teams: Array<object>, ranking: Array<object>}>} Showback response
 */
const getShowback = async (month) => {
  const { monthStart, monthEnd } = getMonthBoundaries(month);

  // Fetch all data in parallel
  const [teamsResult, aiCostsResult, megabillResult] = await Promise.all([
    showbackRepository.getAllTeams(),
    showbackRepository.getAICostsByTeam(monthStart, monthEnd),
    showbackRepository.getMegabillCostsByCategory(monthStart, monthEnd),
  ]);

  const teams = teamsResult.rows;
  const teamIds = teams.map((t) => t.id);

  // Build AI costs map (teamId -> cost)
  const aiCostsByTeam = new Map();
  aiCostsResult.rows.forEach((row) => {
    aiCostsByTeam.set(row.team_id, parseFloat(row.ai_cost));
  });

  // Get megabill totals by category
  let cloudTotal = 0;
  let saasTotal = 0;
  megabillResult.rows.forEach((row) => {
    const cost = parseFloat(row.total_cost);
    if (row.category === 'cloud') {
      cloudTotal = cost;
    } else if (row.category === 'saas') {
      saasTotal = cost;
    }
  });

  // Distribute cloud and SaaS proportionally based on AI cost weight
  const cloudDistribution = distributeCostProportionally(cloudTotal, aiCostsByTeam, teamIds);
  const saasDistribution = distributeCostProportionally(saasTotal, aiCostsByTeam, teamIds);

  // Build showback rows
  const showbackRows = teams.map((team) => {
    const aiCost = parseFloat((aiCostsByTeam.get(team.id) || 0).toFixed(2));
    const cloudCost = parseFloat((cloudDistribution.get(team.id) || 0).toFixed(2));
    const saasCost = parseFloat((saasDistribution.get(team.id) || 0).toFixed(2));
    const totalCost = parseFloat((cloudCost + aiCost + saasCost).toFixed(2));

    const budget = team.budget_monthly !== null
      ? parseFloat(team.budget_monthly)
      : null;

    let budgetPercentage = null;
    let efficiencyRatio = null;
    let overBudget = false;

    if (budget !== null && budget > 0) {
      budgetPercentage = parseFloat(((totalCost / budget) * 100).toFixed(1));
      efficiencyRatio = parseFloat((totalCost / budget).toFixed(2));
      overBudget = budgetPercentage > 100;
    }

    return {
      teamName: team.name,
      cloudCost,
      aiCost,
      saasCost,
      totalCost,
      budget,
      budgetPercentage,
      efficiencyRatio,
      overBudget,
    };
  });

  // Build ranking: only teams with budget, sorted by efficiencyRatio ascending
  const ranking = showbackRows
    .filter((row) => row.budget !== null)
    .sort((a, b) => a.efficiencyRatio - b.efficiencyRatio);

  return { teams: showbackRows, ranking };
};

/**
 * Calculates budget percentage for a team.
 * @param {number} totalCost - Total cost for the team
 * @param {number|null} budget - Assigned budget (null or 0 means no budget)
 * @returns {{ budgetPercentage: number|null, excludeFromRanking: boolean }}
 */
function calculateBudgetPercentage(totalCost, budget) {
  if (budget === null || budget === 0) {
    return { budgetPercentage: null, excludeFromRanking: true };
  }
  const budgetPercentage = parseFloat(((totalCost / budget) * 100).toFixed(1));
  return { budgetPercentage, excludeFromRanking: false };
}

/**
 * Determines if a team has exceeded its budget.
 * @param {number} totalCost - Total cost for the team
 * @param {number|null} budget - Assigned budget (null or 0 means no budget)
 * @returns {{ overBudget: boolean }}
 */
function determineBudgetExceeded(totalCost, budget) {
  if (budget === null || budget === 0) {
    return { overBudget: false };
  }
  return { overBudget: totalCost > budget };
}

module.exports = {
  getShowback,
  getMonthBoundaries,
  distributeCostProportionally,
  calculateBudgetPercentage,
  determineBudgetExceeded,
};
