/**
 * Property-Based Test: Aggregated Totals Equal Sum of Components
 *
 * Feature: ai-cost-tracker-finops, Property 5: Aggregated totals equal sum of components
 *
 * For any set of records contributing to a total (showback total = cloud + AI + SaaS per team;
 * total estimated savings = sum of active recommendations; monthly cost avoidance = sum of
 * actions in month), the reported total SHALL exactly equal the arithmetic sum of its
 * constituent parts.
 *
 * Validates: Requirements 3.1, 7.5, 9.2
 */

const fc = require('fast-check');
const {
  calculateShowbackTotal,
  calculateTotalEstimatedSavings,
  calculateMonthlyCostAvoidance,
  toCents,
  fromCents
} = require('../../src/utils/aggregation.utils');

describe('Feature: ai-cost-tracker-finops, Property 5: Aggregated totals equal sum of components', () => {

  describe('Showback total = cloudCost + aiCost + saasCost', () => {
    it('totalCost SHALL exactly equal the arithmetic sum of cloud + AI + SaaS costs', () => {
      // **Validates: Requirements 3.1**
      fc.assert(
        fc.property(
          // Given: arbitrary cost components in realistic USD range (0.01 to 999,999,999.99)
          fc.integer({ min: 1, max: 99999999999 }).map(c => c / 100),
          fc.integer({ min: 1, max: 99999999999 }).map(c => c / 100),
          fc.integer({ min: 1, max: 99999999999 }).map(c => c / 100),
          (cloudCost, aiCost, saasCost) => {
            // When: we calculate the showback total
            const total = calculateShowbackTotal(cloudCost, aiCost, saasCost);

            // Then: total exactly equals the sum of components (using cents arithmetic)
            const expectedCents = toCents(cloudCost) + toCents(aiCost) + toCents(saasCost);
            const expected = fromCents(expectedCents);

            expect(total).toBe(expected);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('totalCost SHALL be commutative (order of components does not matter)', () => {
      // **Validates: Requirements 3.1**
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 99999999999 }).map(c => c / 100),
          fc.integer({ min: 1, max: 99999999999 }).map(c => c / 100),
          fc.integer({ min: 1, max: 99999999999 }).map(c => c / 100),
          (cloudCost, aiCost, saasCost) => {
            // When: we calculate total in different orders
            const total1 = calculateShowbackTotal(cloudCost, aiCost, saasCost);
            const total2 = calculateShowbackTotal(saasCost, cloudCost, aiCost);
            const total3 = calculateShowbackTotal(aiCost, saasCost, cloudCost);

            // Then: all orderings produce the same result
            expect(total1).toBe(total2);
            expect(total2).toBe(total3);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Total estimated savings = sum of active recommendations', () => {
    it('total savings SHALL exactly equal the sum of individual recommendation savings', () => {
      // **Validates: Requirements 7.5**
      fc.assert(
        fc.property(
          // Given: an array of 1-20 recommendations with savings in realistic range
          fc.array(
            fc.integer({ min: 1, max: 99999999999 }).map(c => ({
              estimatedSavingsUsd: c / 100
            })),
            { minLength: 1, maxLength: 20 }
          ),
          (recommendations) => {
            // When: we calculate total estimated savings
            const total = calculateTotalEstimatedSavings(recommendations);

            // Then: total equals the sum of all individual savings (cents arithmetic)
            const expectedCents = recommendations.reduce(
              (sum, rec) => sum + toCents(rec.estimatedSavingsUsd),
              0
            );
            const expected = fromCents(expectedCents);

            expect(total).toBe(expected);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('empty recommendations list SHALL return 0', () => {
      // **Validates: Requirements 7.5**
      const total = calculateTotalEstimatedSavings([]);
      expect(total).toBe(0);
    });
  });

  describe('Monthly cost avoidance = sum of individual actions', () => {
    it('monthly total SHALL exactly equal the sum of individual action savings', () => {
      // **Validates: Requirements 9.2**
      fc.assert(
        fc.property(
          // Given: an array of 1-20 cost avoidance actions with savings in realistic range
          fc.array(
            fc.integer({ min: 1, max: 99999999999 }).map(c => ({
              estimatedSavingsUsd: c / 100
            })),
            { minLength: 1, maxLength: 20 }
          ),
          (actions) => {
            // When: we calculate monthly cost avoidance total
            const total = calculateMonthlyCostAvoidance(actions);

            // Then: total equals the sum of all individual action savings (cents arithmetic)
            const expectedCents = actions.reduce(
              (sum, action) => sum + toCents(action.estimatedSavingsUsd),
              0
            );
            const expected = fromCents(expectedCents);

            expect(total).toBe(expected);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('empty actions list SHALL return 0', () => {
      // **Validates: Requirements 9.2**
      const total = calculateMonthlyCostAvoidance([]);
      expect(total).toBe(0);
    });
  });
});
