'use strict';

const { getShowback, getMonthBoundaries, distributeCostProportionally } = require('../../src/services/showback.service');
const showbackRepository = require('../../src/repositories/showback.repository');

jest.mock('../../src/repositories/showback.repository');

describe('showback.service', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getMonthBoundaries', () => {
    it('should return correct boundaries for YYYY-MM format', () => {
      const { monthStart, monthEnd } = getMonthBoundaries('2024-06');
      expect(monthStart).toBe('2024-06-01');
      expect(monthEnd).toBe('2024-07-01');
    });

    it('should return correct boundaries for YYYY-MM-DD format', () => {
      const { monthStart, monthEnd } = getMonthBoundaries('2024-12-15');
      expect(monthStart).toBe('2024-12-01');
      expect(monthEnd).toBe('2025-01-01');
    });

    it('should default to current month when no month is provided', () => {
      const { monthStart, monthEnd } = getMonthBoundaries(undefined);
      const now = new Date();
      const expectedYear = now.getFullYear();
      const expectedMonth = String(now.getMonth() + 1).padStart(2, '0');
      expect(monthStart).toBe(`${expectedYear}-${expectedMonth}-01`);
    });
  });

  describe('distributeCostProportionally', () => {
    it('should distribute cost based on AI cost weight', () => {
      const aiCostsByTeam = new Map([
        ['team-1', 100],
        ['team-2', 300],
      ]);
      const teamIds = ['team-1', 'team-2'];

      const result = distributeCostProportionally(1000, aiCostsByTeam, teamIds);

      expect(result.get('team-1')).toBe(250);
      expect(result.get('team-2')).toBe(750);
    });

    it('should return zero for all teams when total cost is zero', () => {
      const aiCostsByTeam = new Map([['team-1', 100]]);
      const teamIds = ['team-1', 'team-2'];

      const result = distributeCostProportionally(0, aiCostsByTeam, teamIds);

      expect(result.get('team-1')).toBe(0);
      expect(result.get('team-2')).toBe(0);
    });

    it('should distribute evenly when all AI costs are zero', () => {
      const aiCostsByTeam = new Map();
      const teamIds = ['team-1', 'team-2'];

      const result = distributeCostProportionally(1000, aiCostsByTeam, teamIds);

      expect(result.get('team-1')).toBe(500);
      expect(result.get('team-2')).toBe(500);
    });

    it('should give zero to teams without AI costs when others have costs', () => {
      const aiCostsByTeam = new Map([['team-1', 200]]);
      const teamIds = ['team-1', 'team-2'];

      const result = distributeCostProportionally(1000, aiCostsByTeam, teamIds);

      expect(result.get('team-1')).toBe(1000);
      expect(result.get('team-2')).toBe(0);
    });
  });

  describe('getShowback', () => {
    const mockTeams = [
      { id: 'team-1', name: 'Célula Vida Digital', budget_monthly: '25000.00', department: 'Vida' },
      { id: 'team-2', name: 'Célula Auto Express', budget_monthly: '18000.00', department: 'Autos' },
      { id: 'team-3', name: 'Célula Core Bancario', budget_monthly: null, department: 'Banca' },
    ];

    const mockAICosts = [
      { team_id: 'team-1', ai_cost: '5000.00' },
      { team_id: 'team-2', ai_cost: '3000.00' },
      { team_id: 'team-3', ai_cost: '2000.00' },
    ];

    const mockMegabill = [
      { category: 'cloud', total_cost: '10000.00' },
      { category: 'saas', total_cost: '5000.00' },
    ];

    beforeEach(() => {
      showbackRepository.getAllTeams.mockResolvedValue({ rows: mockTeams });
      showbackRepository.getAICostsByTeam.mockResolvedValue({ rows: mockAICosts });
      showbackRepository.getMegabillCostsByCategory.mockResolvedValue({ rows: mockMegabill });
    });

    it('should return teams array with correct cost breakdown', async () => {
      const result = await getShowback('2024-06');

      expect(result.teams).toHaveLength(3);

      // Team 1: AI=5000, weight=5000/10000=0.5, cloud=5000, saas=2500
      const team1 = result.teams.find((t) => t.teamName === 'Célula Vida Digital');
      expect(team1.aiCost).toBe(5000);
      expect(team1.cloudCost).toBe(5000);
      expect(team1.saasCost).toBe(2500);
      expect(team1.totalCost).toBe(12500);
    });

    it('should calculate budgetPercentage correctly (1 decimal)', async () => {
      const result = await getShowback('2024-06');

      const team1 = result.teams.find((t) => t.teamName === 'Célula Vida Digital');
      // totalCost=12500, budget=25000 → 50.0%
      expect(team1.budgetPercentage).toBe(50.0);
      expect(team1.efficiencyRatio).toBe(0.5);
      expect(team1.overBudget).toBe(false);
    });

    it('should set overBudget=true when budgetPercentage > 100', async () => {
      showbackRepository.getAllTeams.mockResolvedValue({
        rows: [
          { id: 'team-1', name: 'Team Expensive', budget_monthly: '1000.00', department: 'Test' },
        ],
      });
      showbackRepository.getAICostsByTeam.mockResolvedValue({
        rows: [{ team_id: 'team-1', ai_cost: '1500.00' }],
      });
      showbackRepository.getMegabillCostsByCategory.mockResolvedValue({
        rows: [{ category: 'cloud', total_cost: '500.00' }],
      });

      const result = await getShowback('2024-06');
      const team = result.teams[0];

      expect(team.totalCost).toBeGreaterThan(1000);
      expect(team.overBudget).toBe(true);
      expect(team.budgetPercentage).toBeGreaterThan(100);
    });

    it('should handle teams without budget ("Sin presupuesto" scenario)', async () => {
      const result = await getShowback('2024-06');

      const teamNoBudget = result.teams.find((t) => t.teamName === 'Célula Core Bancario');
      expect(teamNoBudget.budget).toBeNull();
      expect(teamNoBudget.budgetPercentage).toBeNull();
      expect(teamNoBudget.efficiencyRatio).toBeNull();
      expect(teamNoBudget.overBudget).toBe(false);
    });

    it('should exclude teams without budget from ranking', async () => {
      const result = await getShowback('2024-06');

      expect(result.ranking).toHaveLength(2);
      const rankingNames = result.ranking.map((r) => r.teamName);
      expect(rankingNames).not.toContain('Célula Core Bancario');
    });

    it('should sort ranking by efficiencyRatio ascending (lower = more efficient)', async () => {
      const result = await getShowback('2024-06');

      for (let i = 1; i < result.ranking.length; i++) {
        expect(result.ranking[i].efficiencyRatio).toBeGreaterThanOrEqual(
          result.ranking[i - 1].efficiencyRatio
        );
      }
    });

    it('should ensure totalCost equals cloudCost + aiCost + saasCost exactly', async () => {
      const result = await getShowback('2024-06');

      result.teams.forEach((team) => {
        const expectedTotal = parseFloat(
          (team.cloudCost + team.aiCost + team.saasCost).toFixed(2)
        );
        expect(team.totalCost).toBe(expectedTotal);
      });
    });

    it('should call repository with correct month boundaries', async () => {
      await getShowback('2024-03');

      expect(showbackRepository.getAICostsByTeam).toHaveBeenCalledWith(
        '2024-03-01',
        '2024-04-01'
      );
      expect(showbackRepository.getMegabillCostsByCategory).toHaveBeenCalledWith(
        '2024-03-01',
        '2024-04-01'
      );
    });

    it('should handle empty AI costs gracefully', async () => {
      showbackRepository.getAICostsByTeam.mockResolvedValue({ rows: [] });

      const result = await getShowback('2024-06');

      result.teams.forEach((team) => {
        expect(team.aiCost).toBe(0);
      });
    });

    it('should handle empty megabill costs gracefully', async () => {
      showbackRepository.getMegabillCostsByCategory.mockResolvedValue({ rows: [] });

      const result = await getShowback('2024-06');

      result.teams.forEach((team) => {
        expect(team.cloudCost).toBe(0);
        expect(team.saasCost).toBe(0);
      });
    });
  });
});
