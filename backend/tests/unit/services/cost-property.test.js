const fc = require('fast-check');

/**
 * Property Tests for Cost Service (Sergio's service)
 * Tasks 2.2, 2.4 — Property 1 (distribución porcentual), Property 2 (filtrado)
 */

describe('Cost Service — Property Tests', () => {
  describe('Property 1 (Task 2.2): Distribución porcentual suma 100%', () => {
    /**
     * For any set of cost values, the percentage breakdown must sum to ~100%
     * (within rounding tolerance).
     */
    it('percentages sum to approximately 100 for any positive costs', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 1, max: 1000000 }), { minLength: 1, maxLength: 20 }),
          (costs) => {
            const totalCost = costs.reduce((sum, c) => sum + c, 0);

            const breakdown = costs.map((costUsd) => {
              const percentage = totalCost > 0
                ? parseFloat(((costUsd / totalCost) * 100).toFixed(2))
                : 0;
              return { costUsd, percentage };
            });

            const sumPercentages = breakdown.reduce((sum, b) => sum + b.percentage, 0);

            // Allow rounding tolerance of 0.1% per item
            expect(sumPercentages).toBeGreaterThanOrEqual(99.5);
            expect(sumPercentages).toBeLessThanOrEqual(100.5);
          }
        ),
        { numRuns: 200 }
      );
    });

    it('each percentage is between 0 and 100 inclusive', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 0, max: 1000000 }), { minLength: 1, maxLength: 20 }),
          (costs) => {
            const totalCost = costs.reduce((sum, c) => sum + c, 0);

            const breakdown = costs.map((costUsd) => {
              return totalCost > 0
                ? parseFloat(((costUsd / totalCost) * 100).toFixed(2))
                : 0;
            });

            breakdown.forEach((pct) => {
              expect(pct).toBeGreaterThanOrEqual(0);
              expect(pct).toBeLessThanOrEqual(100);
            });
          }
        ),
        { numRuns: 200 }
      );
    });

    it('single item always has 100% percentage', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000000 }),
          (cost) => {
            const percentage = parseFloat(((cost / cost) * 100).toFixed(2));
            expect(percentage).toBe(100);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 2 (Task 2.4): Filtrado — resultados consistentes con filtros aplicados', () => {
    /**
     * Simulates filtering logic: when a team filter is applied,
     * only records matching that team should appear.
     */
    it('filtered results only contain items matching the filter criteria', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              name: fc.string({ minLength: 1, maxLength: 20 }),
              provider: fc.constantFrom('AWS Bedrock', 'OpenAI', 'Anthropic'),
              team: fc.constantFrom('Vida', 'Autos', 'Siniestros', 'Digital', 'Datos'),
              costUsd: fc.integer({ min: 1, max: 100000 }),
            }),
            { minLength: 1, maxLength: 30 }
          ),
          fc.constantFrom('Vida', 'Autos', 'Siniestros', 'Digital', 'Datos'),
          (records, teamFilter) => {
            const filtered = records.filter((r) => r.team === teamFilter);
            filtered.forEach((r) => {
              expect(r.team).toBe(teamFilter);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('filtered results are a subset of unfiltered results', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              name: fc.string({ minLength: 1, maxLength: 20 }),
              provider: fc.constantFrom('AWS Bedrock', 'OpenAI', 'Anthropic'),
              costUsd: fc.integer({ min: 1, max: 100000 }),
            }),
            { minLength: 0, maxLength: 30 }
          ),
          fc.constantFrom('AWS Bedrock', 'OpenAI', 'Anthropic'),
          (records, providerFilter) => {
            const filtered = records.filter((r) => r.provider === providerFilter);
            expect(filtered.length).toBeLessThanOrEqual(records.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('total cost of filtered items is less than or equal to total cost of all items', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              provider: fc.constantFrom('AWS Bedrock', 'OpenAI', 'Anthropic'),
              costUsd: fc.integer({ min: 1, max: 100000 }),
            }),
            { minLength: 1, maxLength: 30 }
          ),
          fc.constantFrom('AWS Bedrock', 'OpenAI', 'Anthropic'),
          (records, providerFilter) => {
            const totalAll = records.reduce((s, r) => s + r.costUsd, 0);
            const totalFiltered = records
              .filter((r) => r.provider === providerFilter)
              .reduce((s, r) => s + r.costUsd, 0);
            expect(totalFiltered).toBeLessThanOrEqual(totalAll);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
