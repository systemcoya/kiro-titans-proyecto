const fc = require('fast-check');
const { projectCost, calculateConfidenceBands, generateProjection, CONFIDENCE_BANDS } = require('../../../src/services/simulator.service');

describe('Simulator Service — Pure Logic', () => {
  describe('projectCost', () => {
    it('calculates compound growth correctly', () => {
      // $100 at 10% for 1 month = $100 * 1.1 = $110
      expect(projectCost(100, 10, 1)).toBeCloseTo(110, 2);
      // $100 at 10% for 3 months = $100 * 1.1^3 = $133.10
      expect(projectCost(100, 10, 3)).toBeCloseTo(133.1, 1);
    });

    it('returns 0 for zero or negative base cost', () => {
      expect(projectCost(0, 50, 6)).toBe(0);
      expect(projectCost(-100, 50, 6)).toBe(0);
    });

    it('handles negative growth (cost decrease)', () => {
      // $100 at -20% for 1 month = $80
      expect(projectCost(100, -20, 1)).toBeCloseTo(80, 2);
    });
  });

  describe('calculateConfidenceBands', () => {
    // Property 17: optimistic < base < pessimistic for positive growth
    it('Property 17: bands maintain ordering optimistic <= base <= pessimistic', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 1, max: 1e9, noNaN: true }),
          fc.float({ min: -50, max: 200, noNaN: true }),
          fc.integer({ min: 1, max: 6 }),
          fc.float({ min: 1000, max: 5000, noNaN: true }),
          (cost, increment, months, rate) => {
            const bands = calculateConfidenceBands(cost, increment, months, rate);
            expect(bands.optimistic.totalCop).toBeLessThanOrEqual(bands.base.totalCop + 0.01);
            expect(bands.base.totalCop).toBeLessThanOrEqual(bands.pessimistic.totalCop + 0.01);
          }
        ),
        { numRuns: 200 }
      );
    });

    it('applies correct adjustments: optimistic=X-15, base=X, pessimistic=X+25', () => {
      const bands = calculateConfidenceBands(1000000, 30, 1, 4200);

      // Base: 1000000 * (1 + 30/100)^1 = 1300000
      expect(bands.base.totalCop).toBeCloseTo(1300000, 0);
      // Optimistic: 1000000 * (1 + 15/100)^1 = 1150000
      expect(bands.optimistic.totalCop).toBeCloseTo(1150000, 0);
      // Pessimistic: 1000000 * (1 + 55/100)^1 = 1550000
      expect(bands.pessimistic.totalCop).toBeCloseTo(1550000, 0);
    });
  });

  describe('generateProjection', () => {
    it('returns projections for all 3 intervals (1, 3, 6 months)', () => {
      const serviceData = [
        { serviceId: 'svc-1', currentMonthlyCostCop: 50000000, percentIncrement: 20 },
      ];

      const result = generateProjection(serviceData, 4200);

      expect(result.intervals).toHaveLength(3);
      expect(result.intervals[0].months).toBe(1);
      expect(result.intervals[1].months).toBe(3);
      expect(result.intervals[2].months).toBe(6);
    });

    it('aggregates multiple services in projection', () => {
      const serviceData = [
        { serviceId: 'svc-1', currentMonthlyCostCop: 10000000, percentIncrement: 10 },
        { serviceId: 'svc-2', currentMonthlyCostCop: 20000000, percentIncrement: 10 },
      ];

      const result = generateProjection(serviceData, 4200);

      // Base at 1 month: (10M * 1.1) + (20M * 1.1) = 33M
      expect(result.intervals[0].base.totalCop).toBeCloseTo(33000000, -2);
    });
  });
});
