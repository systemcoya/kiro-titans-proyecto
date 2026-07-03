const fc = require('fast-check');
const { calculateZScore, classifyAnomaly, detectAnomalies, summarizeAnomalies } = require('../../../src/services/anomaly-detection.service');

describe('Anomaly Detection Service — Pure Logic', () => {
  describe('calculateZScore', () => {
    it('returns 0 when cost equals mean', () => {
      expect(calculateZScore(100, 100, 10)).toBe(0);
    });

    it('returns positive z-score when cost exceeds mean', () => {
      expect(calculateZScore(130, 100, 10)).toBe(3);
    });

    it('returns negative z-score when cost below mean', () => {
      expect(calculateZScore(70, 100, 10)).toBe(-3);
    });

    it('handles zero stddev gracefully', () => {
      expect(calculateZScore(100, 100, 0)).toBe(0);
      expect(calculateZScore(110, 100, 0)).toBe(3.0);
    });
  });

  describe('classifyAnomaly', () => {
    // Property 11: anomaly classification based on z-score thresholds
    it('Property 11: classifies correctly for any z-score', () => {
      fc.assert(
        fc.property(
          fc.float({ min: -10, max: 10, noNaN: true }),
          (zScore) => {
            const result = classifyAnomaly(zScore);
            const absZ = Math.abs(zScore);

            if (absZ >= 3.0) expect(result).toBe('critical');
            else if (absZ >= 2.0) expect(result).toBe('warning');
            else expect(result).toBe('none');
          }
        ),
        { numRuns: 200 }
      );
    });
  });

  describe('detectAnomalies', () => {
    it('returns only stats that exceed threshold', () => {
      const stats = [
        { serviceName: 'svc-1', statDate: '2025-07-15', dailyCost: 500, mean28d: 100, stddev28d: 10 },
        { serviceName: 'svc-2', statDate: '2025-07-15', dailyCost: 105, mean28d: 100, stddev28d: 10 },
        { serviceName: 'svc-3', statDate: '2025-07-15', dailyCost: 130, mean28d: 100, stddev28d: 10 },
      ];

      const anomalies = detectAnomalies(stats);
      expect(anomalies.length).toBe(2);
      expect(anomalies[0].serviceName).toBe('svc-1');
      expect(anomalies[0].severity).toBe('critical');
      expect(anomalies[1].severity).toBe('critical');
    });

    it('returns empty array when no anomalies', () => {
      const stats = [
        { serviceName: 'svc-1', statDate: '2025-07-15', dailyCost: 102, mean28d: 100, stddev28d: 10 },
      ];
      expect(detectAnomalies(stats)).toHaveLength(0);
    });
  });

  describe('summarizeAnomalies', () => {
    it('counts by severity correctly', () => {
      const anomalies = [
        { severity: 'critical' },
        { severity: 'warning' },
        { severity: 'critical' },
      ];
      const summary = summarizeAnomalies(anomalies);
      expect(summary.total).toBe(3);
      expect(summary.critical).toBe(2);
      expect(summary.warning).toBe(1);
    });
  });
});
