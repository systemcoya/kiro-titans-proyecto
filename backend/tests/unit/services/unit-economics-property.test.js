const fc = require('fast-check');
const { calculateUnitCost, determineTrendDirection } = require('../../../src/services/unit-economics.service');

/**
 * Property Tests for Unit Economics Service (Sergio's service)
 * Tasks 3.2, 3.3 — Property 6 (unit cost), Property 12 (trend direction)
 */

describe('Unit Economics Service — Property Tests', () => {
  describe('Property 6 (Task 3.2): Unit cost = totalCost / transactions; null when transactions=0', () => {
    it('returns correct division for any positive cost and transactions', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000000 }),
          fc.integer({ min: 1, max: 1000000 }),
          (cost, transactions) => {
            const result = calculateUnitCost(cost, transactions);
            const expected = parseFloat((cost / transactions).toFixed(4));
            expect(result).toBeCloseTo(expected, 3);
          }
        ),
        { numRuns: 200 }
      );
    });

    it('returns null when transactions is zero', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1000000 }),
          (cost) => {
            const result = calculateUnitCost(cost, 0);
            expect(result).toBeNull();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('unit cost is non-negative when both inputs are positive', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000000 }),
          fc.integer({ min: 1, max: 1000000 }),
          (cost, transactions) => {
            const result = calculateUnitCost(cost, transactions);
            expect(result).toBeGreaterThanOrEqual(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('unit cost is monotonically non-increasing as transactions grow (fixed cost)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 10000, max: 1000000 }),
          fc.integer({ min: 1, max: 100 }),
          (cost, baseTransactions) => {
            const moreTransactions = baseTransactions * 2;
            const unitCostLess = calculateUnitCost(cost, moreTransactions);
            const unitCostMore = calculateUnitCost(cost, baseTransactions);
            expect(unitCostLess).toBeLessThanOrEqual(unitCostMore);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 12 (Task 3.3): Trend direction is consistent with value comparison', () => {
    it('returns "up" when current > previous', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000000 }),
          fc.integer({ min: 1, max: 1000000 }),
          (base, delta) => {
            const previous = base;
            const current = base + delta;
            const result = determineTrendDirection(current, previous);
            expect(result).toBe('up');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('returns "down" when current < previous', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 1000000 }),
          fc.integer({ min: 1, max: 999999 }),
          (base, delta) => {
            const previous = base;
            const current = Math.max(0, base - delta);
            if (current < previous) {
              const result = determineTrendDirection(current, previous);
              expect(result).toBe('down');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('returns "stable" when current equals previous', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000000 }),
          (value) => {
            const result = determineTrendDirection(value, value);
            expect(result).toBe('stable');
          }
        ),
        { numRuns: 50 }
      );
    });

    it('returns null when current is null (zero transactions)', () => {
      const result = determineTrendDirection(null, 100);
      expect(result).toBeNull();
    });

    it('returns "stable" when previous is null (no previous data)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000000 }),
          (current) => {
            const result = determineTrendDirection(current, null);
            expect(result).toBe('stable');
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
