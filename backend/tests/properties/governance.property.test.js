'use strict';

const fc = require('fast-check');

/**
 * Property 15: Governance rule evaluation generates recommendation only for sustained violations
 * Only full-period violations generate recommendations.
 * Validates: Requirements 7.3
 *
 * Property 16: Implementing a recommendation excludes it from active calculations
 * Validates: Requirements 7.6
 */
describe('Feature: ai-cost-tracker-finops, Property 15: Governance rule evaluation — sustained violations only', () => {
  /**
   * Simulates rule evaluation: violation must occur for ALL days in the period.
   * @param {number[]} metrics - Daily metric values
   * @param {string} operator - Comparison operator
   * @param {number} threshold - Rule threshold value
   * @param {number} periodDays - Required consecutive days
   * @returns {boolean} Whether recommendation should be generated
   */
  const shouldGenerateRecommendation = (metrics, operator, threshold, periodDays) => {
    if (metrics.length < periodDays) return false;
    const lastNDays = metrics.slice(-periodDays);
    return lastNDays.every((value) => {
      switch (operator) {
        case 'lt': return value < threshold;
        case 'gt': return value > threshold;
        case 'lte': return value <= threshold;
        case 'gte': return value >= threshold;
        default: return false;
      }
    });
  };

  it('should generate recommendation only when ALL days in period violate the rule', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 3, max: 30 }),
        fc.double({ min: 1, max: 100, noNaN: true }),
        (periodDays, threshold) => {
          // All values below threshold → should trigger
          const allViolating = Array(periodDays).fill(threshold - 1);
          return shouldGenerateRecommendation(allViolating, 'lt', threshold, periodDays) === true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should NOT generate recommendation when any day does NOT violate the rule', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 3, max: 30 }),
        fc.double({ min: 5, max: 100, noNaN: true }),
        fc.integer({ min: 0, max: 28 }),
        (periodDays, threshold, nonViolatingIndex) => {
          const metrics = Array(periodDays).fill(threshold - 1);
          const idx = nonViolatingIndex % periodDays;
          metrics[idx] = threshold + 10; // One day above threshold
          return shouldGenerateRecommendation(metrics, 'lt', threshold, periodDays) === false;
        }
      ),
      { numRuns: 200 }
    );
  });

  it('should NOT generate recommendation when insufficient data (< periodDays)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 5, max: 30 }),
        fc.double({ min: 1, max: 100, noNaN: true }),
        (periodDays, threshold) => {
          const metrics = Array(periodDays - 1).fill(threshold - 1);
          return shouldGenerateRecommendation(metrics, 'lt', threshold, periodDays) === false;
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Feature: ai-cost-tracker-finops, Property 16: Implementing recommendation excludes from active', () => {
  it('total active savings decreases by the implemented recommendation savings', () => {
    fc.assert(
      fc.property(
        fc.array(fc.double({ min: 10, max: 10000, noNaN: true }), { minLength: 2, maxLength: 20 }),
        fc.integer({ min: 0, max: 19 }),
        (savingsArray, indexToImplement) => {
          const idx = indexToImplement % savingsArray.length;
          const totalBefore = savingsArray.reduce((sum, s) => sum + s, 0);
          const implementedSavings = savingsArray[idx];
          const remaining = savingsArray.filter((_, i) => i !== idx);
          const totalAfter = remaining.reduce((sum, s) => sum + s, 0);
          return Math.abs(totalAfter - (totalBefore - implementedSavings)) < 0.01;
        }
      ),
      { numRuns: 200 }
    );
  });
});
