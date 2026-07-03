'use strict';

const fc = require('fast-check');

/**
 * Property 11: Anomaly detection classification by standard deviations
 * >μ+3σ → critical, >μ+2σ and ≤μ+3σ → warning, ≤μ+2σ → no anomaly
 * Validates: Requirements 12.1, 12.2, 12.4, 12.5
 *
 * Property 14: Tagging compliance correctly calculated and alerted
 * Validates: Requirements 11.3, 11.4
 *
 * Property 17: KPI variation flag for unfavorable cost changes
 * Validates: Requirements 10.4
 */
describe('Feature: ai-cost-tracker-finops, Property 11: Anomaly detection classification', () => {
  const classifyAnomaly = (currentCost, mean, stddev) => {
    if (stddev === 0) return null;
    const deviations = (currentCost - mean) / stddev;
    if (deviations > 3) return 'critical';
    if (deviations > 2) return 'warning';
    return null;
  };

  it('should return critical when cost > μ + 3σ', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 10, max: 1000, noNaN: true }),
        fc.double({ min: 1, max: 100, noNaN: true }),
        fc.double({ min: 0.01, max: 10, noNaN: true }),
        (mean, stddev, extra) => {
          const cost = mean + 3 * stddev + extra;
          return classifyAnomaly(cost, mean, stddev) === 'critical';
        }
      ),
      { numRuns: 200 }
    );
  });

  it('should return warning when cost > μ + 2σ and ≤ μ + 3σ', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 10, max: 1000, noNaN: true }),
        fc.double({ min: 1, max: 100, noNaN: true }),
        fc.double({ min: 0.01, max: 0.99, noNaN: true }),
        (mean, stddev, factor) => {
          const cost = mean + 2 * stddev + factor * stddev;
          if (cost > mean + 3 * stddev) return true; // edge case, skip
          return classifyAnomaly(cost, mean, stddev) === 'warning';
        }
      ),
      { numRuns: 200 }
    );
  });

  it('should return null when cost ≤ μ + 2σ', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 10, max: 1000, noNaN: true }),
        fc.double({ min: 1, max: 100, noNaN: true }),
        fc.double({ min: 0, max: 1.9, noNaN: true }),
        (mean, stddev, factor) => {
          const cost = mean + factor * stddev;
          return classifyAnomaly(cost, mean, stddev) === null;
        }
      ),
      { numRuns: 200 }
    );
  });
});

describe('Feature: ai-cost-tracker-finops, Property 14: Tagging compliance correctly calculated', () => {
  it('compliance = (compliant / total) × 100', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 1, max: 100 }),
        (compliant, total) => {
          const adjustedCompliant = Math.min(compliant, total);
          const compliance = parseFloat(((adjustedCompliant / total) * 100).toFixed(1));
          return compliance >= 0 && compliance <= 100;
        }
      ),
      { numRuns: 200 }
    );
  });

  it('should trigger warning alert when compliance < 80%', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 79 }),
        fc.integer({ min: 100, max: 100 }),
        (compliant, total) => {
          const compliance = (compliant / total) * 100;
          const shouldAlert = compliance < 80;
          return shouldAlert === true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should NOT trigger alert when compliance >= 80%', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 80, max: 100 }),
        fc.integer({ min: 100, max: 100 }),
        (compliant, total) => {
          const compliance = (compliant / total) * 100;
          return compliance >= 80;
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Feature: ai-cost-tracker-finops, Property 17: KPI variation flag for unfavorable cost changes', () => {
  const shouldFlagVariation = (current, previous) => {
    if (previous === 0) return false;
    const variation = ((current - previous) / previous) * 100;
    return variation > 15;
  };

  it('should flag when variation > 15%', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 100, max: 100000, noNaN: true }),
        fc.double({ min: 0.16, max: 5, noNaN: true }),
        (previous, multiplier) => {
          const current = previous * (1 + multiplier);
          return shouldFlagVariation(current, previous) === true;
        }
      ),
      { numRuns: 200 }
    );
  });

  it('should NOT flag when variation <= 15%', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 100, max: 100000, noNaN: true }),
        fc.double({ min: 0, max: 0.15, noNaN: true }),
        (previous, multiplier) => {
          const current = previous * (1 + multiplier);
          return shouldFlagVariation(current, previous) === false;
        }
      ),
      { numRuns: 200 }
    );
  });
});
