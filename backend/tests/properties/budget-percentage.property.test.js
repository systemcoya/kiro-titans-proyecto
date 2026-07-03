/**
 * Property-Based Test: Budget Percentage Calculation Correctness
 *
 * Feature: ai-cost-tracker-finops, Property 7: Budget percentage calculation correctness
 *
 * For any team with a non-null, non-zero budget, the budget percentage SHALL equal
 * (totalCost / budget) × 100 rounded to 1 decimal place. Teams without budget SHALL
 * display "Sin presupuesto" and be excluded from the efficiency ranking.
 *
 * Validates: Requirements 3.2, 3.5
 */

const fc = require('fast-check');
const { calculateBudgetPercentage } = require('../../src/services/showback.service');

describe('Feature: ai-cost-tracker-finops, Property 7: Budget percentage calculation correctness', () => {

  describe('When budget is a positive number', () => {
    it('budget percentage SHALL equal (totalCost / budget) × 100 rounded to 1 decimal', () => {
      // **Validates: Requirements 3.2**
      fc.assert(
        fc.property(
          // Given: a totalCost (positive USD amount) and a positive budget
          fc.float({ min: 0, max: 10_000_000, noNaN: true, noDefaultInfinity: true }),
          fc.float({ min: 0.01, max: 10_000_000, noNaN: true, noDefaultInfinity: true }),
          (totalCost, budget) => {
            // When: we calculate budget percentage
            const result = calculateBudgetPercentage(totalCost, budget);

            // Then: percentage equals (totalCost / budget) × 100 rounded to 1 decimal
            const expectedPercentage = Math.round((totalCost / budget) * 100 * 10) / 10;

            expect(result.budgetPercentage).toBeCloseTo(expectedPercentage, 1);
            expect(result.excludeFromRanking).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('budget percentage is never null when budget is positive', () => {
      // **Validates: Requirements 3.2**
      fc.assert(
        fc.property(
          // Given: any positive totalCost and positive budget
          fc.float({ min: 0, max: 10_000_000, noNaN: true, noDefaultInfinity: true }),
          fc.float({ min: 0.01, max: 10_000_000, noNaN: true, noDefaultInfinity: true }),
          (totalCost, budget) => {
            // When: we calculate budget percentage
            const result = calculateBudgetPercentage(totalCost, budget);

            // Then: budgetPercentage is a number (not null)
            expect(result.budgetPercentage).not.toBeNull();
            expect(typeof result.budgetPercentage).toBe('number');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('When budget is null', () => {
    it('team SHALL be excluded from ranking and budgetPercentage is null', () => {
      // **Validates: Requirements 3.5**
      fc.assert(
        fc.property(
          // Given: any positive totalCost with null budget
          fc.float({ min: 0, max: 10_000_000, noNaN: true, noDefaultInfinity: true }),
          (totalCost) => {
            // When: we calculate budget percentage with null budget
            const result = calculateBudgetPercentage(totalCost, null);

            // Then: budgetPercentage is null and team is excluded from ranking
            expect(result.budgetPercentage).toBeNull();
            expect(result.excludeFromRanking).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('When budget is zero (edge case)', () => {
    it('team SHALL be excluded from ranking (treated as no budget)', () => {
      // **Validates: Requirements 3.5**
      fc.assert(
        fc.property(
          // Given: any positive totalCost with zero budget
          fc.float({ min: 0, max: 10_000_000, noNaN: true, noDefaultInfinity: true }),
          (totalCost) => {
            // When: we calculate budget percentage with zero budget
            const result = calculateBudgetPercentage(totalCost, 0);

            // Then: treated same as null — excluded from ranking
            expect(result.budgetPercentage).toBeNull();
            expect(result.excludeFromRanking).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Precision property', () => {
    it('budgetPercentage SHALL have at most 1 decimal place', () => {
      // **Validates: Requirements 3.2**
      fc.assert(
        fc.property(
          // Given: totalCost and budget that produce a valid percentage
          fc.float({ min: 0.01, max: 10_000_000, noNaN: true, noDefaultInfinity: true }),
          fc.float({ min: 0.01, max: 10_000_000, noNaN: true, noDefaultInfinity: true }),
          (totalCost, budget) => {
            // When: we calculate budget percentage
            const result = calculateBudgetPercentage(totalCost, budget);

            // Then: the result has at most 1 decimal place
            const asString = result.budgetPercentage.toString();
            const decimalPart = asString.split('.')[1];
            if (decimalPart) {
              expect(decimalPart.length).toBeLessThanOrEqual(1);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
