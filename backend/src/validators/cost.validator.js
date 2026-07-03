'use strict';

const { z } = require('zod');

/**
 * Valid AI provider values.
 * @type {readonly ['AWS Bedrock', 'OpenAI', 'Anthropic']}
 */
const VALID_PROVIDERS = ['AWS Bedrock', 'OpenAI', 'Anthropic'];

/**
 * Valid groupBy dimension values.
 * @type {readonly ['service', 'team', 'provider']}
 */
const VALID_GROUP_BY = ['service', 'team', 'provider'];

/**
 * Maximum allowed date range in months.
 * @type {number}
 */
const MAX_DATE_RANGE_MONTHS = 12;

/**
 * Zod schema for CostFilters query parameters.
 * Validates date range (max 12 months), provider enum, team string, and groupBy dimension.
 */
const costFiltersSchema = z.object({
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate must be ISO-8601 date format (YYYY-MM-DD)')
    .refine((val) => !isNaN(Date.parse(val)), { message: 'startDate must be a valid date' }),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'endDate must be ISO-8601 date format (YYYY-MM-DD)')
    .refine((val) => !isNaN(Date.parse(val)), { message: 'endDate must be a valid date' }),
  team: z.string().min(1).max(100).optional(),
  provider: z.enum(VALID_PROVIDERS).optional(),
  groupBy: z.enum(VALID_GROUP_BY).default('service'),
}).refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  { message: 'endDate must be after startDate', path: ['endDate'] }
).refine(
  (data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const diffMs = end.getTime() - start.getTime();
    const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30.44);
    return diffMonths <= MAX_DATE_RANGE_MONTHS;
  },
  { message: `Date range must not exceed ${MAX_DATE_RANGE_MONTHS} months`, path: ['endDate'] }
);

/**
 * Validates and parses cost filter input. Returns parsed data or throws a ZodError.
 * @param {object} input - Raw filter input (from query params or body)
 * @returns {{ startDate: string, endDate: string, team?: string, provider?: string, groupBy: string }}
 */
const validateCostFilters = (input) => {
  return costFiltersSchema.parse(input);
};

module.exports = {
  costFiltersSchema,
  validateCostFilters,
  VALID_PROVIDERS,
  VALID_GROUP_BY,
  MAX_DATE_RANGE_MONTHS,
};
