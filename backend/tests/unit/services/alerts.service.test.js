const fc = require('fast-check');
const { calculateSeverity, evaluateAlerts, validateUniqueServiceAlert } = require('../../../src/services/alerts.service');
const { APIError } = require('../../../src/middleware/error-handler');

describe('Alerts Service — Pure Logic', () => {
  describe('calculateSeverity', () => {
    // Property 8: Alert Severity Calculation
    // critical when C>=T, warning when C>=0.8*T and C<T, none when C<0.8*T
    it('Property 8: returns correct severity for any cost/threshold combo', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1000000000 }),
          fc.integer({ min: 1, max: 1000000000 }),
          (cost, threshold) => {
            const severity = calculateSeverity(cost, threshold);

            if (cost >= threshold) {
              expect(severity).toBe('critical');
            } else if (cost >= threshold * 0.8) {
              expect(severity).toBe('warning');
            } else {
              expect(severity).toBe('none');
            }
          }
        ),
        { numRuns: 200 }
      );
    });

    it('returns none when threshold is zero or negative', () => {
      expect(calculateSeverity(100, 0)).toBe('none');
      expect(calculateSeverity(100, -50)).toBe('none');
    });

    it('returns critical when cost equals threshold exactly', () => {
      expect(calculateSeverity(1000000, 1000000)).toBe('critical');
    });

    it('returns warning at exactly 80% of threshold', () => {
      expect(calculateSeverity(800000, 1000000)).toBe('warning');
    });

    it('returns none just below 80% of threshold', () => {
      expect(calculateSeverity(799999, 1000000)).toBe('none');
    });
  });

  describe('evaluateAlerts', () => {
    it('evaluates multiple alerts and detects severity changes', () => {
      const alerts = [
        { id: '1', serviceId: 's1', thresholdCop: 1000000, currentCostCop: 1000000, severity: 'warning' },
        { id: '2', serviceId: 's2', thresholdCop: 500000, currentCostCop: 300000, severity: 'none' },
        { id: '3', serviceId: 's3', thresholdCop: 200000, currentCostCop: 180000, severity: 'none' },
      ];

      const results = evaluateAlerts(alerts);

      expect(results[0]).toEqual({ id: '1', newSeverity: 'critical', previousSeverity: 'warning', triggered: true });
      expect(results[1]).toEqual({ id: '2', newSeverity: 'none', previousSeverity: 'none', triggered: false });
      expect(results[2]).toEqual({ id: '3', newSeverity: 'warning', previousSeverity: 'none', triggered: true });
    });
  });

  describe('validateUniqueServiceAlert', () => {
    // Property 10: duplicate service_id with active rule throws 409
    it('throws 409 when active alert exists for same service', () => {
      const existingAlerts = [
        { serviceId: 'service-abc', isActive: true },
        { serviceId: 'service-xyz', isActive: false },
      ];

      expect(() => validateUniqueServiceAlert('service-abc', existingAlerts))
        .toThrow(APIError);

      try {
        validateUniqueServiceAlert('service-abc', existingAlerts);
      } catch (err) {
        expect(err.statusCode).toBe(409);
      }
    });

    it('does NOT throw when service has no active alerts', () => {
      const existingAlerts = [
        { serviceId: 'service-abc', isActive: false },
      ];

      expect(() => validateUniqueServiceAlert('service-abc', existingAlerts)).not.toThrow();
    });

    it('does NOT throw for a new service', () => {
      const existingAlerts = [
        { serviceId: 'service-abc', isActive: true },
      ];

      expect(() => validateUniqueServiceAlert('service-new', existingAlerts)).not.toThrow();
    });
  });
});
