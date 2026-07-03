'use strict';

const { z } = require('zod');
const { APIError } = require('../middleware/error-handler');

/**
 * Zod schema for showback query parameters.
 * Accepts optional month in YYYY-MM or YYYY-MM-DD format.
 */
const showbackQuerySchema = z.object({
  month: z
    .string()
    .regex(
      /^\d{4}-(0[1-9]|1[0-2])(-([0-2]\d|3[01]))?$/,
      'month must be in YYYY-MM or YYYY-MM-DD format'
    )
    .optional(),
});

/**
 * Express middleware that validates showback query parameters.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const validateShowbackQuery = (req, res, next) => {
  const result = showbackQuerySchema.safeParse(req.query);

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.') || 'month',
      reason: issue.message,
    }));

    throw new APIError(
      400,
      'Bad Request',
      'Parámetros de consulta inválidos.',
      details
    );
  }

  req.validatedQuery = result.data;
  next();
};

module.exports = { showbackQuerySchema, validateShowbackQuery };
