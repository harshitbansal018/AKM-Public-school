import { z } from 'zod';
import { PAGINATION } from '../config/constants.js';

/** Route params arrive as strings; coerce and reject anything non-numeric. */
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive('Invalid id'),
});

export const slugParamSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Invalid slug'),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(PAGINATION.maxLimit).default(PAGINATION.defaultLimit),
  q: z.string().trim().max(120).optional(),
});

export const reorderSchema = z.object({
  ids: z.array(z.coerce.number().int().positive()).min(1, 'Send at least one id'),
});

/** Trimmed string that treats '' as "not provided". */
export const optionalText = (max = 500) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((value) => (value === '' ? null : value));

/**
 * A field with a default that also tolerates null and ''.
 *
 * Zod's `.default()` only fires on `undefined`, but a browser form that leaves
 * an optional emoji blank sends `null` — which would otherwise be rejected as
 * "Expected string, received null". This normalises empty to undefined first,
 * so the default actually applies.
 */
export const withDefault = (schema, fallback) =>
  z.preprocess(
    (value) => (value === null || value === undefined || value === '' ? undefined : value),
    schema.default(fallback)
  );

export const defaultedText = (fallback, max = 10) =>
  withDefault(z.string().trim().max(max), fallback);

export const defaultedEnum = (values, fallback) => withDefault(z.enum(values), fallback);

export const sortOrder = z.preprocess(
  (value) => (value === null || value === '' ? undefined : value),
  z.coerce.number().int().min(0).max(9999).optional()
);

export const booleanish = z
  .union([z.boolean(), z.enum(['true', 'false', '1', '0'])])
  .transform((value) => value === true || value === 'true' || value === '1');
