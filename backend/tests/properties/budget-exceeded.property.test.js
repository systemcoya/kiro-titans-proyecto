/**
 * Property-Based Test: Budget Exceeded Flag Set Correctly
 *
 * Feature: ai-cost-tracker-finops, Property 13: Budget exceeded flag set correctly
 *
 * For any team whose budget percentage exceeds 100%, the `overBudget` flag SHALL be true
 * and the row SHALL be visually highlighted. For teams at or below 100%, the flag SHALL be false.
 *
 * Validates: Requirements 3.4
 */

const fc = require('fast-check');
const { determineBudgetExceeded } = require('../../src/services/showback.service');

describe('Feature: ai-cost-tracker-finops, Property 13: Budget exceeded flag set correctly', () => {

  describe('When budget percentage exceeds 100%', () => {
    it('overBudget SHALL be true when totalCost > budget', () => {
      // **Validates: Requirements 3.4**
      fc.assert(
        fc.property(
          // Given: a positive budget and a totalCost strictly greater than budget
          fc.float({ min: Math.fround(0.01), max: Math.fround(10_000_000), noNaN: true, noDefaultInfinity: true }),
          fc.float({ min: Math.fround(0.01), max: Math.fround(10_000_000), noNaN: true, noDefaultInfinity: true }),
          (budget, extra) => {
            // When: totalCost exceeds budget (budget percentage > 100%)
            const totalCost = budget + extra;
            const result = determineBudgetExceeded(totalCost, budget);

            // Then: overBudget flag SHALL be true
            expect(result.overBudget).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('When budget percentage is at or below 100%', () => {
    it('overBudget SHALL be false when totalCost <= budget', () => {
      // **Validates: Requirements 3.4**
      fc.assert(
        fc.property(
          // Given: a positive budget and a fraction [0, 1] to compute totalCost <= budget
          fc.float({ min: Math.fround(0.01), max: Math.fround(10_000_000), noNaN: true, noDefaultInfinity: true }),
          fc.float({ min: Math.fround(0), max: Math.fround(1), noNaN: true, noDefaultInfinity: true }),
          (budget, fraction) => {
            // When: totalCost is at most equal to budget (percentage <= 100%)
            const totalCost = budget * fraction;
            const result = determineBudgetExceeded(totalCost, budget);

            // Then: overBudget flag SHALL be false
            expect(result.overBudget).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('When budget is null or zero (no budget assigned)', () => {
    it('overBudget SHALL be false when budget is null', () => {
      // **Validates: Requirements 3.4**
      fc.assert(
        fc.property(
          // Given: any totalCost with null budget
          fc.float({ min: Math.fround(0), max: Math.fround(10_000_000), noNaN: true, noDefaultInfinity: true }),
          (totalCost) => {
            // When: budget is null (team has no budget to exceed)
            const result = determineBudgetExceeded(totalCost, null);

            // Then: overBudget SHALL be false (cannot exceed a non-existent budget)
            expect(result.overBudget).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('overBudget SHALL be false when budget is zero', () => {
      // **Validates: Requirements 3.4**
      fc.assert(
        fc.property(
          // Given: any totalCost with zero budget
          fc.float({ min: Math.fround(0), max: Math.fround(10_000_000), noNaN: true, noDefaultInfinity: true }),
          (totalCost) => {
            // When: budget is 0 (treated as no budget assigned)
            const result = determineBudgetExceeded(totalCost, 0);

            // Then: overBudget SHALL be false
            expect(result.overBudget).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Edge case: exactly at 100%', () => {
    it('overBudget SHALL be false when totalCost equals budget exactly', () => {
      // **Validates: Requirements 3.4**
      fc.assert(
        fc.property(
          // Given: a positive budget where totalCost equals budget exactly
          fc.float({ min: Math.fround(0.01), max: Math.fround(10_000_000), noNaN: true, noDefaultInfinity: true }),
          (budget) => {
            // When: totalCost equals budget (percentage is exactly 100%)
            const totalCost = budget;
            const result = determineBudgetExceeded(totalCost, budget);

            // Then: overBudget SHALL be false (only >100% triggers the flag)
            expect(result.overBudget).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
