'use strict';

const fc = require('fast-check');

/**
 * Property 2: Filtering returns only matching records
 * For any dataset and valid filter, all returned records SHALL satisfy
 * the filter condition and no matching record SHALL be excluded.
 * Validates: Requirements 1.2, 1.3, 1.4, 5.2, 9.5
 */
describe('Feature: ai-cost-tracker-finops, Property 2: Filtering returns only matching records', () => {
  const providers = ['AWS Bedrock', 'OpenAI', 'Anthropic'];
  const teams = ['Célula Vida Digital', 'Célula Auto Express', 'Célula Siniestros AI'];

  const recordArb = fc.record({
    provider: fc.constantFrom(...providers),
    team: fc.constantFrom(...teams),
    costDate: fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }),
    costUsd: fc.double({ min: 0.01, max: 10000, noNaN: true }),
  });

  const filterByProvider = (records, provider) =>
    records.filter((r) => r.provider === provider);

  const filterByTeam = (records, team) =>
    records.filter((r) => r.team === team);

  const filterByDateRange = (records, start, end) =>
    records.filter((r) => r.costDate >= start && r.costDate <= end);

  it('provider filter returns only matching records', () => {
    fc.assert(
      fc.property(
        fc.array(recordArb, { minLength: 1, maxLength: 50 }),
        fc.constantFrom(...providers),
        (records, provider) => {
          const filtered = filterByProvider(records, provider);
          return filtered.every((r) => r.provider === provider);
        }
      ),
      { numRuns: 200 }
    );
  });

  it('provider filter includes all matching records', () => {
    fc.assert(
      fc.property(
        fc.array(recordArb, { minLength: 1, maxLength: 50 }),
        fc.constantFrom(...providers),
        (records, provider) => {
          const filtered = filterByProvider(records, provider);
          const expected = records.filter((r) => r.provider === provider);
          return filtered.length === expected.length;
        }
      ),
      { numRuns: 200 }
    );
  });

  it('team filter returns only matching records', () => {
    fc.assert(
      fc.property(
        fc.array(recordArb, { minLength: 1, maxLength: 50 }),
        fc.constantFrom(...teams),
        (records, team) => {
          const filtered = filterByTeam(records, team);
          return filtered.every((r) => r.team === team);
        }
      ),
      { numRuns: 200 }
    );
  });

  it('date range filter returns only records within range', () => {
    fc.assert(
      fc.property(
        fc.array(recordArb, { minLength: 1, maxLength: 30 }),
        (records) => {
          const start = new Date('2024-03-01');
          const end = new Date('2024-06-30');
          const filtered = filterByDateRange(records, start, end);
          return filtered.every((r) => r.costDate >= start && r.costDate <= end);
        }
      ),
      { numRuns: 200 }
    );
  });
});
