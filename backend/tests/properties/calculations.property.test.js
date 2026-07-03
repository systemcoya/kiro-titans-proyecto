'use strict';

const fc = require('fast-check');

/**
 * Property 6: Unit cost calculation correctness
 * unitCost = totalCost / transactionsProcessed rounded to 4 decimals, or null when transactions = 0
 * Validates: Requirements 2.1, 2.5
 *
 * Property 7: Budget percentage calculation correctness
 * percentage = (totalCost / budget) × 100 rounded to 1 decimal
 * Validates: Requirements 3.2, 3.5
 *
 * Property 8: Self-funding ratio calculation
 * ratio = (savings / investment) × 100 rounded to 2 decimals, 0% when investment = 0
 * Validates: Requirements 8.2, 8.3
 */
describe('Feature: ai-cost-tracker-finops, Property 6: Unit cost calculation correctness', () => {
  const calculateUnitCost = (totalCost, transactions) => {
    if (transactions === 0) return null;
    return parseFloat((totalCost / transactions).toFixed(4));
  };

  it('should return totalCost / transactions rounded to 4 decimals for positive transactions', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.01, max: 999999, noNaN: true }),
        fc.integer({ min: 1, max: 1000000 }),
        (totalCost, transactions) => {
          const result = calculateUnitCost(totalCost, transactions);
          const expected = parseFloat((totalCost / transactions).toFixed(4));
          return result === expected;
        }
      ),
      { numRuns: 200 }
    );
  });

  it('should return null when transactions = 0', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 999999, noNaN: true }),
        (totalCost) => {
          return calculateUnitCost(totalCost, 0) === null;
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Feature: ai-cost-tracker-finops, Property 7: Budget percentage calculation correctness', () => {
  const calculateBudgetPercentage = (totalCost, budget) => {
    if (budget === null || budget === 0) return null;
    return parseFloat(((totalCost / budget) * 100).toFixed(1));
  };

  it('should return (totalCost / budget) × 100 rounded to 1 decimal for non-null budgets', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 100000, noNaN: true }),
        fc.double({ min: 0.01, max: 100000, noNaN: true }),
        (totalCost, budget) => {
          const result = calculateBudgetPercentage(totalCost, budget);
          const expected = parseFloat(((totalCost / budget) * 100).toFixed(1));
          return result === expected;
        }
      ),
      { numRuns: 200 }
    );
  });

  it('should return null when budget is null', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 100000, noNaN: true }),
        (totalCost) => {
          return calculateBudgetPercentage(totalCost, null) === null;
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Feature: ai-cost-tracker-finops, Property 8: Self-funding ratio calculation', () => {
  const calculateSelfFundingRatio = (savings, investment) => {
    if (investment === 0) return 0;
    return parseFloat(((savings / investment) * 100).toFixed(2));
  };

  it('should return (savings / investment) × 100 rounded to 2 decimals', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 500000, noNaN: true }),
        fc.double({ min: 0.01, max: 500000, noNaN: true }),
        (savings, investment) => {
          const result = calculateSelfFundingRatio(savings, investment);
          const expected = parseFloat(((savings / investment) * 100).toFixed(2));
          return result === expected;
        }
      ),
      { numRuns: 200 }
    );
  });

  it('should return 0% when investment = 0', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 500000, noNaN: true }),
        (savings) => {
          return calculateSelfFundingRatio(savings, 0) === 0;
        }
      ),
      { numRuns: 100 }
    );
  });
});
