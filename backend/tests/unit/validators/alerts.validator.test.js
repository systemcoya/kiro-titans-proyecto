const fc = require('fast-check');
const { createAlertSchema } = require('../../../src/validators/alerts.validator');

describe('Alert Validator — Zod Schemas', () => {
  // Property 9: zero/negative threshold rejected, invalid email rejected
  describe('createAlertSchema', () => {
    it('Property 9: rejects zero threshold', () => {
      const result = createAlertSchema.safeParse({
        serviceId: '550e8400-e29b-41d4-a716-446655440000',
        thresholdCop: 0,
        recipientEmail: 'test@segurosbolivar.com',
      });
      expect(result.success).toBe(false);
    });

    it('Property 9: rejects negative threshold', () => {
      const result = createAlertSchema.safeParse({
        serviceId: '550e8400-e29b-41d4-a716-446655440000',
        thresholdCop: -100,
        recipientEmail: 'test@segurosbolivar.com',
      });
      expect(result.success).toBe(false);
    });

    it('Property 9: rejects invalid email', () => {
      const result = createAlertSchema.safeParse({
        serviceId: '550e8400-e29b-41d4-a716-446655440000',
        thresholdCop: 50000000,
        recipientEmail: 'not-an-email',
      });
      expect(result.success).toBe(false);
    });

    it('Property 9: rejects non-UUID serviceId', () => {
      const result = createAlertSchema.safeParse({
        serviceId: 'not-a-uuid',
        thresholdCop: 50000000,
        recipientEmail: 'test@segurosbolivar.com',
      });
      expect(result.success).toBe(false);
    });

    it('accepts valid alert creation input', () => {
      const result = createAlertSchema.safeParse({
        serviceId: '550e8400-e29b-41d4-a716-446655440000',
        thresholdCop: 50000000,
        recipientEmail: 'finops@segurosbolivar.com',
      });
      expect(result.success).toBe(true);
    });

    it('Property 9 (fast-check): all positive thresholds with valid emails pass', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 999999999 }),
          (threshold) => {
            const result = createAlertSchema.safeParse({
              serviceId: '550e8400-e29b-41d4-a716-446655440000',
              thresholdCop: threshold,
              recipientEmail: 'test@segurosbolivar.com',
            });
            expect(result.success).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
