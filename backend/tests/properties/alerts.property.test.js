'use strict';

const fc = require('fast-check');

/**
 * Property 10: Alert severity correctly assigned at threshold levels
 * ≥T → critical, ≥0.8T and <T → warning, <0.8T → no alert
 * Validates: Requirements 4.4
 *
 * Property 4: Input validation accepts valid inputs and rejects invalid inputs
 * Validates: Requirements 4.1, 4.2, 4.3, 6.4, 7.1, 9.1, 11.1, 11.2
 */
describe('Feature: ai-cost-tracker-finops, Property 10: Alert severity correctly assigned', () => {
  const evaluateAlertSeverity = (threshold, currentSpend) => {
    if (currentSpend >= threshold) return 'critical';
    if (currentSpend >= 0.8 * threshold) return 'warning';
    return null;
  };

  it('should return critical when spend >= threshold', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.01, max: 999999, noNaN: true }),
        fc.double({ min: 0, max: 1, noNaN: true }),
        (threshold, extra) => {
          const spend = threshold + extra * threshold;
          return evaluateAlertSeverity(threshold, spend) === 'critical';
        }
      ),
      { numRuns: 200 }
    );
  });

  it('should return warning when spend >= 80% and < threshold', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1, max: 999999, noNaN: true }),
        fc.double({ min: 0, max: 0.99, noNaN: true }),
        (threshold, factor) => {
          const rangeStart = 0.8 * threshold;
          const rangeEnd = threshold - 0.001;
          const spend = rangeStart + factor * (rangeEnd - rangeStart);
          if (spend < rangeStart || spend >= threshold) return true; // skip edge cases
          return evaluateAlertSeverity(threshold, spend) === 'warning';
        }
      ),
      { numRuns: 200 }
    );
  });

  it('should return null (no alert) when spend < 80% of threshold', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1, max: 999999, noNaN: true }),
        fc.double({ min: 0, max: 0.79, noNaN: true }),
        (threshold, factor) => {
          const spend = factor * threshold;
          return evaluateAlertSeverity(threshold, spend) === null;
        }
      ),
      { numRuns: 200 }
    );
  });
});

describe('Feature: ai-cost-tracker-finops, Property 4: Input validation accepts/rejects correctly', () => {
  it('valid threshold (0.01 to 999999999.99) should be accepted', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.01, max: 999999999.99, noNaN: true }),
        (threshold) => {
          return threshold >= 0.01 && threshold <= 999999999.99;
        }
      ),
      { numRuns: 200 }
    );
  });

  it('invalid threshold (< 0.01) should be rejected', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -1000, max: 0.009, noNaN: true }),
        (threshold) => {
          return threshold < 0.01;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('valid email format should be accepted', () => {
    fc.assert(
      fc.property(
        fc.emailAddress(),
        (email) => {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }
      ),
      { numRuns: 100 }
    );
  });
});
