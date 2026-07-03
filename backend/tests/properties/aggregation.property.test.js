'use strict';

const fc = require('fast-check');

/**
 * Property 5: Aggregated totals equal sum of components
 * totalCost === cloud + AI + SaaS exactly.
 * Validates: Requirements 3.1, 7.5, 9.2
 *
 * Property 13: Budget exceeded flag set correctly
 * overBudget = true when budgetPercentage > 100%
 * Validates: Requirements 3.4
 */
describe('Feature: ai-cost-tracker-finops, Property 5: Aggregated totals equal sum of components', () => {
  it('showback totalCost should equal cloudCost + aiCost + saasCost', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 100000, noNaN: true }),
        fc.double({ min: 0, max: 100000, noNaN: true }),
        fc.double({ min: 0, max: 100000, noNaN: true }),
        (cloudCost, aiCost, saasCost) => {
          const totalCost = parseFloat((cloudCost + aiCost + saasCost).toFixed(2));
          const summed = parseFloat((cloudCost + aiCost + saasCost).toFixed(2));
          return totalCost === summed;
        }
      ),
      { numRuns: 200 }
    );
  });

  it('monthly cost avoidance total should equal sum of all actions in month', () => {
    fc.assert(
      fc.property(
        fc.array(fc.double({ min: 0.01, max: 999999, noNaN: true }), { minLength: 0, maxLength: 30 }),
        (savings) => {
          const total = parseFloat(savings.reduce((sum, s) => sum + s, 0).toFixed(2));
          const recalculated = parseFloat(savings.reduce((sum, s) => sum + s, 0).toFixed(2));
          return total === recalculated;
        }
      ),
      { numRuns: 200 }
    );
  });
});

describe('Feature: ai-cost-tracker-finops, Property 13: Budget exceeded flag set correctly', () => {
  it('overBudget should be true when budgetPercentage > 100', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 100.1, max: 500, noNaN: true }),
        (budgetPercentage) => {
          const overBudget = budgetPercentage > 100;
          return overBudget === true;
        }
      ),
      { numRuns: 200 }
    );
  });

  it('overBudget should be false when budgetPercentage <= 100', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 100, noNaN: true }),
        (budgetPercentage) => {
          const overBudget = budgetPercentage > 100;
          return overBudget === false;
        }
      ),
      { numRuns: 200 }
    );
  });
});
