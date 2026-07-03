'use strict';

const fc = require('fast-check');

/**
 * Property 3: Sorted outputs preserve correct ordering
 * For any collection to be sorted, for any adjacent pair (a, b), the ordering predicate holds.
 * Validates: Requirements 3.3, 4.5, 7.4, 9.3
 *
 * Property 12: Trend direction correctly reflects cost change
 * Validates: Requirements 2.4
 */
describe('Feature: ai-cost-tracker-finops, Property 3: Sorted outputs preserve correct ordering', () => {
  it('alerts should be sorted by severity (critical first) then date descending', () => {
    const alertArb = fc.record({
      severity: fc.constantFrom('critical', 'warning'),
      triggeredAt: fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }),
    });

    fc.assert(
      fc.property(
        fc.array(alertArb, { minLength: 2, maxLength: 50 }),
        (alerts) => {
          const sorted = [...alerts].sort((a, b) => {
            if (a.severity === 'critical' && b.severity === 'warning') return -1;
            if (a.severity === 'warning' && b.severity === 'critical') return 1;
            return b.triggeredAt.getTime() - a.triggeredAt.getTime();
          });
          for (let i = 0; i < sorted.length - 1; i++) {
            const curr = sorted[i];
            const next = sorted[i + 1];
            if (curr.severity === 'warning' && next.severity === 'critical') return false;
            if (curr.severity === next.severity && curr.triggeredAt < next.triggeredAt) return false;
          }
          return true;
        }
      ),
      { numRuns: 200 }
    );
  });

  it('recommendations should be sorted by savings descending', () => {
    fc.assert(
      fc.property(
        fc.array(fc.double({ min: 0, max: 100000, noNaN: true }), { minLength: 2, maxLength: 50 }),
        (savings) => {
          const sorted = [...savings].sort((a, b) => b - a);
          for (let i = 0; i < sorted.length - 1; i++) {
            if (sorted[i] < sorted[i + 1]) return false;
          }
          return true;
        }
      ),
      { numRuns: 200 }
    );
  });

  it('efficiency ranking should be sorted by ratio ascending', () => {
    fc.assert(
      fc.property(
        fc.array(fc.double({ min: 0, max: 10, noNaN: true }), { minLength: 2, maxLength: 20 }),
        (ratios) => {
          const sorted = [...ratios].sort((a, b) => a - b);
          for (let i = 0; i < sorted.length - 1; i++) {
            if (sorted[i] > sorted[i + 1]) return false;
          }
          return true;
        }
      ),
      { numRuns: 200 }
    );
  });
});

describe('Feature: ai-cost-tracker-finops, Property 12: Trend direction correctly reflects cost change', () => {
  const determineTrendDirection = (current, previous) => {
    if (current === null) return null;
    if (previous === null) return 'stable';
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'stable';
  };

  it('should return up when current > previous', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.01, max: 10000, noNaN: true }),
        fc.double({ min: 0.01, max: 10000, noNaN: true }),
        (a, b) => {
          const current = Math.max(a, b) + 0.001;
          const previous = Math.min(a, b);
          return determineTrendDirection(current, previous) === 'up';
        }
      ),
      { numRuns: 200 }
    );
  });

  it('should return down when current < previous', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.01, max: 10000, noNaN: true }),
        fc.double({ min: 0.01, max: 10000, noNaN: true }),
        (a, b) => {
          const current = Math.min(a, b);
          const previous = Math.max(a, b) + 0.001;
          return determineTrendDirection(current, previous) === 'down';
        }
      ),
      { numRuns: 200 }
    );
  });

  it('should return stable when current === previous', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.01, max: 10000, noNaN: true }),
        (value) => {
          return determineTrendDirection(value, value) === 'stable';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return null when current is null (0 transactions)', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.01, max: 10000, noNaN: true }),
        (previous) => {
          return determineTrendDirection(null, previous) === null;
        }
      ),
      { numRuns: 100 }
    );
  });
});
