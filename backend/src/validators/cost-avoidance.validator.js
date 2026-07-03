'use strict';

const { z } = require('zod');

const VALID_ACTION_TYPES = ['revisión arquitectónica', 'rightsizing preventivo', 'eliminación de propuesta'];

const costAvoidanceActionSchema = z.object({
  resource: z.string().min(1).max(100, 'El recurso debe tener máximo 100 caracteres'),
  actionType: z.enum(VALID_ACTION_TYPES, {
    errorMap: () => ({ message: `Tipo de acción inválido. Valores permitidos: ${VALID_ACTION_TYPES.join(', ')}` }),
  }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe ser formato ISO-8601 (YYYY-MM-DD)'),
  estimatedSavingsUsd: z.number().min(0.01).max(999999999.99, 'El monto debe estar entre 0.01 y 999,999,999.99'),
});

const monthQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'El mes debe ser formato YYYY-MM').optional(),
});

/**
 * Validates cost avoidance action creation input.
 * @param {object} input
 * @returns {object} Parsed data
 */
const validateCostAvoidanceAction = (input) => {
  return costAvoidanceActionSchema.parse(input);
};

/**
 * Validates month query parameter.
 * @param {object} input
 * @returns {object} Parsed data
 */
const validateMonthQuery = (input) => {
  return monthQuerySchema.parse(input);
};

module.exports = { validateCostAvoidanceAction, validateMonthQuery, VALID_ACTION_TYPES };
