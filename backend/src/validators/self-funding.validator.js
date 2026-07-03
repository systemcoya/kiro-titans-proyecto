const { z } = require('zod');

/**
 * Zod schemas for self-funding endpoint validation.
 * Implements Requirements 7 — timeline query params.
 */

const timelineQuerySchema = z.object({
  months: z.coerce.number()
    .int({ message: 'El número de meses debe ser un entero' })
    .min(1, { message: 'Mínimo 1 mes' })
    .max(24, { message: 'Máximo 24 meses' })
    .default(12),
});

module.exports = {
  timelineQuerySchema,
};
