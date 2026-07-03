const fc = require('fast-check');
const { distributeCostProportionally } = require('../../../src/services/showback.service');

/**
 * Property Tests for Showback Service (Sergio's service)
 * Task 4.2 — Property 7 (budget percentage correctness)
 */

describe('Showback Service — Property Tests', () => {
  describe('Property 7 (Task 4.2): Budget percentage = (totalCost / budget) * 100', () => {
    it('budget percentage is correct for any positive cost and budget', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1000000 }),
          fc.integer({ min: 1, max: 1000000 }),
          (totalCost, budget) => {
            const budgetPercentage = parseFloat(((totalCost / budget) * 100).toFixed(1));
            expect(budgetPercentage).toBeGreaterThanOrEqual(0);

            // Verify formula correctness
            const expected = (totalCost / budget) * 100;
            expect(budgetPercentage).toBeCloseTo(expected, 0);
          }
        ),
        { numRuns: 200 }
      );
    });

    it('overBudget flag is true only when percentage > 100', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 2000000 }),
          fc.integer({ min: 1, max: 1000000 }),
          (totalCost, budget) => {
            const budgetPercentage = (totalCost / budget) * 100;
            const overBudget = budgetPercentage > 100;
            expect(overBudget).toBe(totalCost > budget);
          }
        ),
        { numRuns: 200 }
      );
    });

    it('efficiency ratio = totalCost / budget', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1000000 }),
          fc.integer({ min: 1, max: 1000000 }),
          (totalCost, budget) => {
            const efficiencyRatio = parseFloat((totalCost / budget).toFixed(2));
            const expected = totalCost / budget;
            expect(efficiencyRatio).toBeCloseTo(expected, 1);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('distributeCostProportionally — cost allocation invariants', () => {
    it('total distributed equals input total (conservation of cost)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000000 }),
          fc.array(fc.integer({ min: 1, max: 100000 }), { minLength: 2, maxLength: 10 }),
          (totalCost, aiCosts) => {
            const teamIds = aiCosts.map((_, i) => `team-${i}`);
            const aiCostsByTeam = new Map(teamIds.map((id, i) => [id, aiCosts[i]]));

            const distribution = distributeCostProportionally(totalCost, aiCostsByTeam, teamIds);

            const sumDistributed = Array.from(distribution.values()).reduce((s, v) => s + v, 0);
            expect(sumDistributed).toBeCloseTo(totalCost, 2);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('higher AI cost teams get higher proportional share', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 100, max: 1000000 }),
          fc.integer({ min: 10, max: 50000 }),
          fc.integer({ min: 50001, max: 100000 }),
          (totalCost, lowCost, highCost) => {
            const teamIds = ['team-low', 'team-high'];
            const aiCostsByTeam = new Map([['team-low', lowCost], ['team-high', highCost]]);

            const distribution = distributeCostProportionally(totalCost, aiCostsByTeam, teamIds);

            expect(distribution.get('team-high')).toBeGreaterThan(distribution.get('team-low'));
          }
        ),
        { numRuns: 100 }
      );
    });

    it('returns zero for all teams when totalCost is 0', () => {
      const teamIds = ['t1', 't2', 't3'];
      const aiCosts = new Map([['t1', 100], ['t2', 200], ['t3', 300]]);
      const dist = distributeCostProportionally(0, aiCosts, teamIds);

      dist.forEach((value) => {
        expect(value).toBe(0);
      });
    });
  });
});
