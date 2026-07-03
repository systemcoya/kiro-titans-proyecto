const fc = require('fast-check');
const { simulatorProjectSchema } = require('../../../src/validators/simulator.validator');

describe('Simulator Validator — Zod Schemas', () => {
  // Property 18: values in [-50, 200] accepted, values outside rejected
  describe('simulatorProjectSchema', () => {
    it('Property 18: accepts values within valid range [-50, 200]', () => {
      fc.assert(
        fc.property(
          fc.float({ min: -50, max: 200, noNaN: true }),
          (increment) => {
            const result = simulatorProjectSchema.safeParse({
              serviceIncrements: [{
                serviceId: '550e8400-e29b-41d4-a716-446655440000',
                percentIncrement: increment,
              }],
            });
            expect(result.success).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property 18: rejects values below -50', () => {
      const result = simulatorProjectSchema.safeParse({
        serviceIncrements: [{
          serviceId: '550e8400-e29b-41d4-a716-446655440000',
          percentIncrement: -51,
        }],
      });
      expect(result.success).toBe(false);
    });

    it('Property 18: rejects values above 200', () => {
      const result = simulatorProjectSchema.safeParse({
        serviceIncrements: [{
          serviceId: '550e8400-e29b-41d4-a716-446655440000',
          percentIncrement: 201,
        }],
      });
      expect(result.success).toBe(false);
    });

    it('rejects empty serviceIncrements array', () => {
      const result = simulatorProjectSchema.safeParse({
        serviceIncrements: [],
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid UUID for serviceId', () => {
      const result = simulatorProjectSchema.safeParse({
        serviceIncrements: [{
          serviceId: 'invalid',
          percentIncrement: 30,
        }],
      });
      expect(result.success).toBe(false);
    });
  });
});
