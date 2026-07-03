const fc = require('fast-check');
const { calculateSelfFundingRatio, calculateTrend, buildSelfFundingDashboard } = require('../../../src/services/self-funding.service');

describe('Self-Funding Service — Pure Logic', () => {
  describe('calculateSelfFundingRatio', () => {
    // Property 16: for any positive I and S, ratio = (S/I)×100 and isSelfFunded = ratio >= 100
    it('Property 16: ratio = (savings/investment)×100 for positive values', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000000000 }),
          fc.integer({ min: 1, max: 1000000000 }),
          (savings, investment) => {
            const result = calculateSelfFundingRatio(savings, investment);
            const expectedRatio = Math.round(((savings / investment) * 100) * 100) / 100;

            expect(result.ratio).toBeCloseTo(expectedRatio, 1);
            expect(result.isSelfFunded).toBe(result.ratio >= 100);
          }
        ),
        { numRuns: 200 }
      );
    });

    it('returns ratio 0 and isSelfFunded false when investment is 0', () => {
      const result = calculateSelfFundingRatio(500000, 0);
      expect(result.ratio).toBe(0);
      expect(result.isSelfFunded).toBe(false);
    });

    it('returns isSelfFunded true when savings exceed investment', () => {
      const result = calculateSelfFundingRatio(150000000, 100000000);
      expect(result.ratio).toBe(150);
      expect(result.isSelfFunded).toBe(true);
    });

    it('returns exactly 100 when savings equal investment', () => {
      const result = calculateSelfFundingRatio(100000000, 100000000);
      expect(result.ratio).toBe(100);
      expect(result.isSelfFunded).toBe(true);
    });
  });

  describe('calculateTrend', () => {
    it('returns up when current > previous by more than 1%', () => {
      expect(calculateTrend(110, 100)).toBe('up');
    });

    it('returns down when current < previous by more than 1%', () => {
      expect(calculateTrend(90, 100)).toBe('down');
    });

    it('returns stable when change is within 1%', () => {
      expect(calculateTrend(100.5, 100)).toBe('stable');
    });

    it('returns stable when both are zero', () => {
      expect(calculateTrend(0, 0)).toBe('stable');
    });

    it('returns up when previous is 0 and current is positive', () => {
      expect(calculateTrend(50, 0)).toBe('up');
    });
  });

  describe('buildSelfFundingDashboard', () => {
    it('builds complete dashboard with all fields', () => {
      const data = {
        totalAiInvestment: 200000000,
        totalSavings: 146000000,
        previousRatio: 65,
      };

      const result = buildSelfFundingDashboard(data);

      expect(result.investment).toBe(200000000);
      expect(result.savings).toBe(146000000);
      expect(result.ratio).toBe(73);
      expect(result.isSelfFunded).toBe(false);
      expect(result.trend).toBe('up');
    });
  });
});
