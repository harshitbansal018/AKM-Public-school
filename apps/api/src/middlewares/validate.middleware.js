import { ApiError } from '../utils/ApiError.js';

/** "maxMarks" -> "Max marks", "resultDate" -> "Result date". */
const humanise = (key) =>
  key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[._]/g, ' ')
    .toLowerCase()
    .replace(/^./, (c) => c.toUpperCase());

/** Zod's stock wording, reworded for the person filling in the form. */
const reword = (message) =>
  message
    .replace(/^String must contain at least (\d+) character\(s\)$/, 'must be at least $1 characters')
    .replace(/^String must contain at most (\d+) character\(s\)$/, 'must be at most $1 characters')
    .replace(/^Number must be greater than or equal to (\S+)$/, 'must be $1 or more')
    .replace(/^Number must be less than or equal to (\S+)$/, 'must be $1 or less')
    .replace(/^Required$/, 'is required')
    .replace(/^Invalid email$/, 'is not a valid email address')
    .replace(/^Invalid date$/, 'is not a valid date')
    .replace(/^Expected (\w+), received \w+$/, 'must be a $1');

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
      // One readable sentence per problem — "Exam must be at least 2 characters" —
      // so the person is told what to fix, not just that something is wrong.
      // One line per field: the first problem is the one to fix.
      const summary = errors
        .filter((error, index) => errors.findIndex((other) => other.field === error.field) === index)
        .map(({ field, message }) => {
          const worded = reword(message);
          return worded === message ? `${humanise(field)}: ${message}` : `${humanise(field)} ${worded}`;
        })
        .join('. ');
      return next(ApiError.badRequest(summary, errors));
    }

    // req.query is a getter on newer Express; assign to a parallel field instead.
    if (source === 'query') req.validatedQuery = result.data;
    else req[source] = result.data;

    return next();
  };
}

export default validate;
