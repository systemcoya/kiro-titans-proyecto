const { validateStatusTransition, calculateTotalSavings, calculateRealizedSavings, evaluatePolicy } = require('../../../src/services/governance.service');
const { APIError } = require('../../../src/middleware/error-handler');

describe('Governance Service — Pure Logic', () => {
  describe('validateStatusTransition', () => {
    // Property 14: accept/dismiss only from active
    it('allows active → accepted', () => {
      expect(() => validateStatusTransition('active', 'accepted')).not.toThrow();
    });

    it('allows active → dismissed', () => {
      expect(() => validateStatusTransition('active', 'dismissed')).not.toThrow();
    });

    it('rejects transition from accepted', () => {
      expect(() => validateStatusTransition('accepted', 'dismissed')).toThrow(APIError);
    });

    it('rejects transition from dismissed', () => {
      expect(() => validateStatusTransition('dismissed', 'accepted')).toThrow(APIError);
    });

    it('rejects invalid target status', () => {
      expect(() => validateStatusTransition('active', 'invalid')).toThrow(APIError);
    });
  });

  describe('calculateTotalSavings', () => {
    // Property 15: total = sum of estimated_saving_cop where status = "active"
    it('sums only active recommendations', () => {
      const recommendations = [
        { estimatedSavingCop: 5000000, status: 'active' },
        { estimatedSavingCop: 3000000, status: 'active' },
        { estimatedSavingCop: 8000000, status: 'accepted' },
        { estimatedSavingCop: 2000000, status: 'dismissed' },
      ];

      expect(calculateTotalSavings(recommendations)).toBe(8000000);
    });

    it('returns 0 when no active recommendations', () => {
      const recommendations = [
        { estimatedSavingCop: 5000000, status: 'dismissed' },
      ];

      expect(calculateTotalSavings(recommendations)).toBe(0);
    });
  });

  describe('calculateRealizedSavings', () => {
    it('sums only accepted recommendations', () => {
      const recommendations = [
        { estimatedSavingCop: 5000000, status: 'active' },
        { estimatedSavingCop: 8000000, status: 'accepted' },
        { estimatedSavingCop: 3000000, status: 'accepted' },
      ];

      expect(calculateRealizedSavings(recommendations)).toBe(11000000);
    });
  });

  describe('evaluatePolicy', () => {
    it('returns matching resources that violate the policy', () => {
      const policy = {
        conditions: { metric: 'cpu_utilization_avg', operator: 'less_than', value: 10, durationDays: 7 },
        resourceType: 'compute',
      };

      const resources = [
        { id: 'ec2-001', resourceType: 'compute', metrics: { cpu_utilization_avg: 5 }, currentConfig: 't3.xlarge', recommendedConfig: 't3.small', estimatedSavingCop: 2500000 },
        { id: 'ec2-002', resourceType: 'compute', metrics: { cpu_utilization_avg: 45 }, currentConfig: 't3.large', recommendedConfig: 't3.large', estimatedSavingCop: 0 },
        { id: 'rds-001', resourceType: 'database', metrics: { cpu_utilization_avg: 3 }, currentConfig: 'db.r5.large', recommendedConfig: 'db.r5.small', estimatedSavingCop: 4000000 },
      ];

      const results = evaluatePolicy(policy, resources);

      expect(results).toHaveLength(1);
      expect(results[0].resourceId).toBe('ec2-001');
      expect(results[0].estimatedSavingCop).toBe(2500000);
    });

    it('returns empty array when no resources match', () => {
      const policy = {
        conditions: { metric: 'cpu_utilization_avg', operator: 'less_than', value: 10, durationDays: 7 },
        resourceType: 'compute',
      };

      const resources = [
        { id: 'ec2-001', resourceType: 'compute', metrics: { cpu_utilization_avg: 50 } },
      ];

      expect(evaluatePolicy(policy, resources)).toHaveLength(0);
    });
  });
});
