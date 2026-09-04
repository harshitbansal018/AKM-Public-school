import { ApiError } from '../utils/ApiError.js';

/**
 * Runs a Zod schema against the request and replaces the raw input with the
 * parsed result — so controllers receive coerced, trimmed, known-shape data
 * and never have to check types themselves.
 *
 * @param {import('zod').ZodTypeAny} schema
 * @param {'body'|'query'|'params'} source
 */
export function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || source,
        message: issue.message,
      }));
      return next(ApiError.badRequest('Please check the highlighted fields', errors));
    }

    // req.query is a getter on newer Express; assign to a parallel field instead.
    if (source === 'query') req.validatedQuery = result.data;
    else req[source] = result.data;

    return next();
  };
}

export default validate;
