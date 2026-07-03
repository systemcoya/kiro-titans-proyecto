const fc = require('fast-check');
const { calculateMonthOverMonth, detectKpiWarning, getTopConsumers } = require('../../../src/services/executive.service');

describe('Executive Service — Pure Logic', () => {
  describe('calculateMonthOverMonth', () => {
    // Property 19: absoluteDiff = C - P, percentVariation = ((C-P)/P)×100
    it('Property 19: metrics are mathematically correct for any spend values', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1000000000 }),
          fc.integer({ min: 1, max: 1000000000 }),
          (current, previous) => {
            const result = calculateMonthOverMonth(current, previous);

            const expectedDiff = Math.round((current - previous) * 100) / 100;
            const expectedPercent = Math.round((((current - previous) / previous) * 100) * 100) / 100;

            expect(result.absoluteDiffCop).toBeCloseTo(expectedDiff, 0);
            expect(result.percentVariation).toBeCloseTo(expectedPercent, 0);

            if (expectedPercent > 1) expect(result.trendDirection).toBe('up');
            else if (expectedPercent < -1) expect(result.trendDirection).toBe('down');
            else expect(result.trendDirection).toBe('stable');
          }
        ),
        { numRuns: 200 }
      );
    });

    it('handles zero previous spend gracefully', () => {
      const result = calculateMonthOverMonth(50000000, 0);
      expect(result.percentVariation).toBe(0);
      expect(result.absoluteDiffCop).toBe(50000000);
    });
  });

  describe('detectKpiWarning', () => {
    it('flags warning when cost increases more than 10% (lower_is_better)', () => {
      expect(detectKpiWarning(115, 100, 'lower_is_better')).toBe(true);
    });

    it('no warning when cost increases less than 10%', () => {
      expect(detectKpiWarning(108, 100, 'lower_is_better')).toBe(false);
    });

    it('flags warning when higher_is_better KPI drops more than 10%', () => {
      expect(detectKpiWarning(85, 100, 'higher_is_better')).toBe(true);
    });

    it('returns false when previous is zero', () => {
      expect(detectKpiWarning(100, 0, 'lower_is_better')).toBe(false);
    });
  });

  describe('getTopConsumers', () => {
    // Property 20: max 5 elements, sorted descending by spendCop
    it('Property 20: returns max N elements sorted descending', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              name: fc.string({ minLength: 1, maxLength: 20 }),
              spendCop: fc.integer({ min: 0, max: 1000000000 }),
            }),
            { minLength: 0, maxLength: 20 }
          ),
          (consumers) => {
            const result = getTopConsumers(consumers, 5);

            // Max 5 elements
            expect(result.length).toBeLessThanOrEqual(5);

            // Sorted descending
            for (let i = 1; i < result.length; i++) {
              expect(result[i - 1].spendCop).toBeGreaterThanOrEqual(result[i].spendCop);
            }

            // Ranks start at 1 and are sequential
            result.forEach((item, idx) => {
              expect(item.rank).toBe(idx + 1);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
