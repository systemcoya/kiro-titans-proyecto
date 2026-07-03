const fc = require('fast-check');
const { calculateTotalAvoidance, groupByActionType, calculateMonthlyTrend } = require('../../../src/services/cost-avoidance.service');

describe('Cost Avoidance Service — Pure Logic', () => {
  describe('calculateTotalAvoidance', () => {
    // Property 3: sorted outputs — total is sum of all records
    it('Property 3: total equals sum of all savings', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              estimatedSavingsUsd: fc.integer({ min: 1, max: 100000 }),
              actionDate: fc.constant('2025-07-01'),
            }),
            { minLength: 0, maxLength: 20 }
          ),
          (records) => {
            const result = calculateTotalAvoidance(records);
            const expectedSum = records.reduce((s, r) => s + r.estimatedSavingsUsd, 0);
            expect(result.totalUsd).toBe(expectedSum);
            expect(result.count).toBe(records.length);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('groupByActionType', () => {
    it('groups records correctly', () => {
      const records = [
        { actionType: 'resize', estimatedSavingsUsd: 100 },
        { actionType: 'resize', estimatedSavingsUsd: 200 },
        { actionType: 'delete', estimatedSavingsUsd: 50 },
      ];

      const result = groupByActionType(records);
      expect(result).toHaveLength(2);
      expect(result[0].actionType).toBe('resize');
      expect(result[0].totalUsd).toBe(300);
      expect(result[1].actionType).toBe('delete');
      expect(result[1].totalUsd).toBe(50);
    });

    it('sorts by totalUsd descending', () => {
      const records = [
        { actionType: 'delete', estimatedSavingsUsd: 500 },
        { actionType: 'resize', estimatedSavingsUsd: 100 },
      ];

      const result = groupByActionType(records);
      expect(result[0].actionType).toBe('delete');
    });
  });

  describe('calculateMonthlyTrend', () => {
    it('groups by month and sorts chronologically', () => {
      const records = [
        { actionDate: '2025-06-15', estimatedSavingsUsd: 100 },
        { actionDate: '2025-07-01', estimatedSavingsUsd: 200 },
        { actionDate: '2025-06-20', estimatedSavingsUsd: 50 },
      ];

      const trend = calculateMonthlyTrend(records);
      expect(trend).toHaveLength(2);
      expect(trend[0].month).toBe('2025-06');
      expect(trend[0].totalUsd).toBe(150);
      expect(trend[1].month).toBe('2025-07');
      expect(trend[1].totalUsd).toBe(200);
    });
  });
});
