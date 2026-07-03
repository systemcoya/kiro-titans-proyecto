const fc = require('fast-check');
const { validateTagCompliance, calculateComplianceRate, VALID_ENVIRONMENTS } = require('../../../src/services/tagging.service');

describe('Tagging Service — Pure Logic', () => {
  describe('validateTagCompliance', () => {
    // Property 14: tagging compliance — all required tags present = compliant
    it('Property 14: compliant when all required tags present with valid values', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.constantFrom(...VALID_ENVIRONMENTS),
          (team, project, environment) => {
            const result = validateTagCompliance({ team, project, environment });
            expect(result.isCompliant).toBe(true);
            expect(result.missingTags).toHaveLength(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('non-compliant when team is missing', () => {
      const result = validateTagCompliance({ project: 'test', environment: 'desarrollo' });
      expect(result.isCompliant).toBe(false);
      expect(result.missingTags).toContain('team');
    });

    it('non-compliant when environment is invalid', () => {
      const result = validateTagCompliance({ team: 'a', project: 'b', environment: 'invalid' });
      expect(result.isCompliant).toBe(false);
      expect(result.invalidValues[0].tag).toBe('environment');
    });
  });

  describe('calculateComplianceRate', () => {
    it('returns 100% when all resources are compliant', () => {
      const resources = [
        { resourceId: 'r1', team: 'datos', project: 'ml', environment: 'producción' },
        { resourceId: 'r2', team: 'autos', project: 'api', environment: 'desarrollo' },
      ];
      const result = calculateComplianceRate(resources);
      expect(result.compliancePercent).toBe(100);
      expect(result.compliantCount).toBe(2);
    });

    it('returns correct percentage with mixed compliance', () => {
      const resources = [
        { resourceId: 'r1', team: 'datos', project: 'ml', environment: 'producción' },
        { resourceId: 'r2', team: null, project: null, environment: null },
      ];
      const result = calculateComplianceRate(resources);
      expect(result.compliancePercent).toBe(50);
      expect(result.nonCompliant).toHaveLength(1);
    });

    it('returns 100% for empty resources (vacuous truth)', () => {
      const result = calculateComplianceRate([]);
      expect(result.compliancePercent).toBe(100);
    });
  });
});
