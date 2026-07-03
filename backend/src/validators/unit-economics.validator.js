'use strict';

const { z } = require('zod');

/**
 * Maximum allowed custom date range in days.
 * @type {number}
 */
const MAX_CUSTOM_RANGE_DAYS = 90;

/**
 * Valid preset period values.
 * @type {readonly ['week', 'month']}
 */
const VALID_PERIODS = ['week', 'month'];

/**
 * ISO-8601 date regex pattern (YYYY-MM-DD).
 * @type {RegExp}
 */
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Zod schema for unit economics query parameters.
 * Supports preset periods (week, month) or custom date range (startDate + endDate, max 90 days).
 */
const unitEconomicsQuerySchema = z.object({
  period: z
    .enum(['week', 'month'])
    .optional(),
  startDate: z
    .string()
    .regex(ISO_DATE_REGEX, 'startDate must be ISO-8601 date format (YYYY-MM-DD)')
    .refine((val) => !isNaN(Date.parse(val)), { message: 'startDate must be a valid date' })
    .optional(),
  endDate: z
    .string()
    .regex(ISO_DATE_REGEX, 'endDate must be ISO-8601 date format (YYYY-MM-DD)')
    .refine((val) => !isNaN(Date.parse(val)), { message: 'endDate must be a valid date' })
    .optional(),
}).refine(
  (data) => {
    // Must have either period OR (startDate + endDate)
    const hasPeriod = !!data.period;
    const hasCustomRange = !!data.startDate && !!data.endDate;
    return hasPeriod || hasCustomRange;
  },
  { message: 'Either period (week|month) or startDate+endDate must be provided', path: ['period'] }
).refine(
  (data) => {
    // Cannot have both period and custom range
    if (data.period && (data.startDate || data.endDate)) {
      return false;
    }
    return true;
  },
  { message: 'Cannot specify both period and custom date range', path: ['period'] }
).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) > new Date(data.startDate);
    }
    return true;
  },
  { message: 'endDate must be after startDate', path: ['endDate'] }
).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      const diffMs = end.getTime() - start.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      return diffDays <= MAX_CUSTOM_RANGE_DAYS;
    }
    return true;
  },
  { message: `Custom date range must not exceed ${MAX_CUSTOM_RANGE_DAYS} days`, path: ['endDate'] }
);

/**
 * Validates and parses unit economics query input.
 * @param {object} input - Raw query parameters
 * @returns {{ period?: string, startDate?: string, endDate?: string }}
 * @throws {import('zod').ZodError} If validation fails
 */
const validateUnitEconomicsQuery = (input) => {
  return unitEconomicsQuerySchema.parse(input);
};

module.exports = {
  unitEconomicsQuerySchema,
  validateUnitEconomicsQuery,
  VALID_PERIODS,
  MAX_CUSTOM_RANGE_DAYS,
};
