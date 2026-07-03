const { z } = require('zod');

/**
 * Zod schemas for governance policies and recommendations.
 * Implements Requirements 6.1 — policy conditions, resource types.
 */

const conditionsSchema = z.object({
  metric: z.string().min(1, { message: 'La métrica es requerida' }),
  operator: z.enum(['less_than', 'greater_than', 'equals'], {
    errorMap: () => ({ message: 'Operador inválido. Usar: less_than, greater_than, equals' }),
  }),
  value: z.number({ required_error: 'El valor de la condición es requerido' }),
  durationDays: z.number()
    .int()
    .min(1, { message: 'La duración mínima es 1 día' })
    .max(90, { message: 'La duración máxima es 90 días' }),
});

const createPolicySchema = z.object({
  name: z.string()
    .min(3, { message: 'El nombre debe tener mínimo 3 caracteres' })
    .max(150, { message: 'El nombre excede la longitud máxima de 150 caracteres' }),
  description: z.string().max(500).optional(),
  conditions: conditionsSchema,
  resourceType: z.enum(['compute', 'database', 'storage'], {
    errorMap: () => ({ message: 'Tipo de recurso inválido. Usar: compute, database, storage' }),
  }),
});

const updatePolicySchema = z.object({
  name: z.string().min(3).max(150).optional(),
  description: z.string().max(500).optional(),
  conditions: conditionsSchema.optional(),
  resourceType: z.enum(['compute', 'database', 'storage']).optional(),
  isActive: z.boolean().optional(),
});

const policyIdParamSchema = z.object({
  id: z.string().uuid({ message: 'El ID de política debe ser un UUID válido' }),
});

const recommendationFilterSchema = z.object({
  status: z.enum(['active', 'accepted', 'dismissed']).optional(),
  policyId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

module.exports = {
  createPolicySchema,
  updatePolicySchema,
  policyIdParamSchema,
  recommendationFilterSchema,
  conditionsSchema,
};
