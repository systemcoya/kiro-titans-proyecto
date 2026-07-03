'use strict';

const { z } = require('zod');

const VALID_ENVIRONMENTS = ['desarrollo', 'staging', 'producción'];

const resourceTagSchema = z.object({
  resourceId: z.string().min(1).max(100),
  team: z.string().min(1).max(50, 'Equipo debe tener máximo 50 caracteres'),
  project: z.string().min(1).max(50, 'Proyecto debe tener máximo 50 caracteres'),
  environment: z.enum(VALID_ENVIRONMENTS, {
    errorMap: () => ({ message: `Ambiente inválido. Valores permitidos: ${VALID_ENVIRONMENTS.join(', ')}` }),
  }),
  aiUseCase: z.string().min(1).max(100, 'Caso de uso IA debe tener máximo 100 caracteres'),
});

/**
 * Validates resource tag creation/update input.
 * @param {object} input
 * @returns {object} Parsed data
 */
const validateResourceTag = (input) => {
  return resourceTagSchema.parse(input);
};

module.exports = { validateResourceTag, VALID_ENVIRONMENTS };
