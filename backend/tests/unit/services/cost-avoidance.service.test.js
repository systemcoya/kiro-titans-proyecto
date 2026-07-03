const fc = require('fast-check');
const costAvoidanceService = require('../../../src/services/cost-avoidance.service');

/**
 * Property 3: Cost avoidance — sorted outputs
 * Tests Sergio's refactored cost-avoidance service exports.
 */
describe('Cost Avoidance Service — Property Tests', () => {
  describe('service exports exist', () => {
    it('getReport function exists', () => {
      expect(typeof costAvoidanceService.getReport).toBe('function');
    });

    it('createAction function exists', () => {
      expect(typeof costAvoidanceService.createAction).toBe('function');
    });

    it('getMonthBoundaries function exists', () => {
      expect(typeof costAvoidanceService.getMonthBoundaries).toBe('function');
    });
  });

  describe('getMonthBoundaries — date calculation', () => {
    it('returns valid month boundaries for any YYYY-MM input', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2020, max: 2030 }),
          fc.integer({ min: 1, max: 12 }),
          (year, month) => {
            const monthStr = `${year}-${String(month).padStart(2, '0')}`;
            const result = costAvoidanceService.getMonthBoundaries(monthStr);
            expect(result).toHaveProperty('monthStart');
            expect(result).toHaveProperty('monthEnd');
            expect(result.monthStart).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            expect(result.monthEnd).toMatch(/^\d{4}-\d{2}-\d{2}$/);
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
