const { z } = require('zod');

/**
 * Zod schemas for What-If Cost Projection Simulator.
 * Implements Requirements 8.5, 8.6 — percentIncrement range [-50, 200].
 */

const serviceIncrementSchema = z.object({
  serviceId: z.string().uuid({ message: 'serviceId debe ser un UUID válido' }),
  percentIncrement: z.number()
    .min(-50, { message: 'El incremento mínimo permitido es -50%' })
    .max(200, { message: 'El incremento máximo permitido es 200%' }),
});

const simulatorProjectSchema = z.object({
  serviceIncrements: z.array(serviceIncrementSchema)
    .min(1, { message: 'Debe incluir al menos un servicio para la proyección' })
    .max(20, { message: 'Máximo 20 servicios por simulación' }),
});

module.exports = {
  serviceIncrementSchema,
  simulatorProjectSchema,
};
