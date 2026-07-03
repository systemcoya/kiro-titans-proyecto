const { z } = require('zod');

/**
 * Zod schemas for alert rules validation.
 * Implements Requirements 4.2, 4.3 — threshold > 0, valid email, UUID serviceId.
 */

const createAlertSchema = z.object({
  serviceId: z.string().uuid({ message: 'serviceId debe ser un UUID válido' }),
  thresholdCop: z.number()
    .positive({ message: 'El umbral debe ser un número positivo mayor a cero' })
    .max(999999999999.99, { message: 'El umbral excede el máximo permitido' }),
  recipientEmail: z.string()
    .email({ message: 'El email del destinatario no tiene formato válido' })
    .max(255, { message: 'El email excede la longitud máxima' }),
});

const updateAlertSchema = z.object({
  thresholdCop: z.number()
    .positive({ message: 'El umbral debe ser un número positivo mayor a cero' })
    .max(999999999999.99, { message: 'El umbral excede el máximo permitido' })
    .optional(),
  recipientEmail: z.string()
    .email({ message: 'El email del destinatario no tiene formato válido' })
    .max(255, { message: 'El email excede la longitud máxima' })
    .optional(),
  isActive: z.boolean().optional(),
});

const alertIdParamSchema = z.object({
  id: z.string().uuid({ message: 'El ID de alerta debe ser un UUID válido' }),
});

const alertHistoryQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  severity: z.enum(['warning', 'critical']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

module.exports = {
  createAlertSchema,
  updateAlertSchema,
  alertIdParamSchema,
  alertHistoryQuerySchema,
};
