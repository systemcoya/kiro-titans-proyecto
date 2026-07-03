'use strict';

const { z } = require('zod');

/**
 * Valid megabill categories.
 * @type {readonly ['cloud', 'saas', 'licenses']}
 */
const VALID_CATEGORIES = ['cloud', 'saas', 'licenses'];

/**
 * Zod schema for validating the category path parameter in drill-down requests.
 * Ensures category is one of the allowed values.
 */
const categoryParamSchema = z.object({
  category: z.enum(VALID_CATEGORIES, {
    errorMap: () => ({
      message: `Categoría inválida. Valores permitidos: ${VALID_CATEGORIES.join(', ')}`,
    }),
  }),
});

/**
 * Validates the category path parameter.
 * @param {string} category - The category value from req.params
 * @returns {{ success: true, data: { category: string } } | { success: false, error: import('zod').ZodError }}
 */
const validateCategoryParam = (category) => {
  return categoryParamSchema.safeParse({ category });
};

module.exports = { categoryParamSchema, validateCategoryParam, VALID_CATEGORIES };
