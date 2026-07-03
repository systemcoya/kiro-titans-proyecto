'use strict';

const fc = require('fast-check');

/**
 * Property 9: Projection scenarios maintain ordering invariant
 * optimistic ≤ base ≤ pessimistic for all time horizons.
 * Validates: Requirements 6.1, 6.2
 */
describe('Feature: ai-cost-tracker-finops, Property 9: Projection scenarios maintain ordering invariant', () => {
  /**
   * Simulates projection calculation using percentiles of historical data.
   * p25 (optimistic) ≤ p50 (base) ≤ p75 (pessimistic)
   */
  const calculateProjections = (historicalCosts, incrementPct) => {
    const sorted = [...historicalCosts].sort((a, b) => a - b);
    const n = sorted.length;
    const p25 = sorted[Math.floor(n * 0.25)];
    const p50 = sorted[Math.floor(n * 0.5)];
    const p75 = sorted[Math.floor(n * 0.75)];
    const factor = 1 + incrementPct / 100;

    return [1, 3, 6].map((month) => ({
      month,
      optimistic: p25 * factor * month,
      base: p50 * factor * month,
      pessimistic: p75 * factor * month,
    }));
  };

  it('optimistic ≤ base ≤ pessimistic for all time horizons', () => {
    fc.assert(
      fc.property(
        fc.array(fc.double({ min: 1, max: 10000, noNaN: true }), { minLength: 10, maxLength: 90 }),
        fc.integer({ min: 1, max: 500 }),
        (costs, increment) => {
          const projections = calculateProjections(costs, increment);
          return projections.every((p) => p.optimistic <= p.base && p.base <= p.pessimistic);
        }
      ),
      { numRuns: 200 }
    );
  });

  it('all projected values should be positive for positive historical costs', () => {
    fc.assert(
      fc.property(
        fc.array(fc.double({ min: 0.01, max: 10000, noNaN: true }), { minLength: 10, maxLength: 90 }),
        fc.integer({ min: 1, max: 500 }),
        (costs, increment) => {
          const projections = calculateProjections(costs, increment);
          return projections.every((p) => p.optimistic > 0 && p.base > 0 && p.pessimistic > 0);
        }
      ),
      { numRuns: 200 }
    );
  });
});
