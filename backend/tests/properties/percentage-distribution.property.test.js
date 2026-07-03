'use strict';

const fc = require('fast-check');

/**
 * Property 1: Percentage distributions sum to 100%
 * For any non-empty set of cost items, the sum of all percentage values
 * SHALL equal 100.0% (±0.1%).
 * Validates: Requirements 1.1, 5.5
 */
describe('Feature: ai-cost-tracker-finops, Property 1: Percentage distributions sum to 100%', () => {
  const calculatePercentages = (costs) => {
    const total = costs.reduce((sum, c) => sum + c, 0);
    if (total === 0) return costs.map(() => 0);
    return costs.map((c) => (c / total) * 100);
  };

  it('should sum to 100% for any non-empty array of positive costs', () => {
    fc.assert(
      fc.property(
        fc.array(fc.double({ min: 0.01, max: 999999, noNaN: true }), { minLength: 1, maxLength: 50 }),
        (costs) => {
          const percentages = calculatePercentages(costs);
          const sum = percentages.reduce((a, b) => a + b, 0);
          return Math.abs(sum - 100) < 0.1;
        }
      ),
      { numRuns: 200 }
    );
  });

  it('should have each percentage equal (itemCost / totalCost) × 100', () => {
    fc.assert(
      fc.property(
        fc.array(fc.double({ min: 0.01, max: 999999, noNaN: true }), { minLength: 1, maxLength: 20 }),
        (costs) => {
          const total = costs.reduce((sum, c) => sum + c, 0);
          const percentages = calculatePercentages(costs);
          return costs.every((cost, i) => Math.abs(percentages[i] - (cost / total) * 100) < 0.01);
        }
      ),
      { numRuns: 200 }
    );
  });
});
