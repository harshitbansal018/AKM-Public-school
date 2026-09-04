import { Prisma } from '@prisma/client';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

/**
 * The single place every error is turned into a response.
 *
 * Rule: only ApiError messages reach the client. Prisma errors are translated
 * into safe equivalents, and anything unrecognised becomes a generic 500 — a
 * raw database error must never leak table names or SQL to a browser.
 */
// eslint-disable-next-line no-unused-vars -- Express identifies error middleware by arity
export function errorMiddleware(err, req, res, next) {
  let error = err;

  if (!(error instanceof ApiError)) {
    error = translate(err);
  }

  if (error.statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl}`, err);
  } else {
    logger.warn(`${req.method} ${req.originalUrl} -> ${error.statusCode}: ${error.message}`);
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(error.errors ? { errors: error.errors } : {}),
    // Stack traces are useful locally and dangerous in production.
    ...(env.isProduction ? {} : { stack: err.stack }),
  });
}

function translate(err) {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        const fields = err.meta?.target;
        const label = Array.isArray(fields) ? fields.join(', ') : 'value';
        return ApiError.conflict(`That ${label} is already in use`);
      }
      case 'P2025':
        return ApiError.notFound('That record no longer exists');
      case 'P2003':
        return ApiError.badRequest('That change would break a related record');
      default:
        return ApiError.badRequest('The database rejected that request');
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return ApiError.badRequest('Invalid data sent to the database');
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    return ApiError.internal('Cannot reach the database');
  }

  // Body parser rejecting malformed JSON
  if (err.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    return ApiError.badRequest('Request body is not valid JSON');
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return ApiError.badRequest('That file is too large');
  }

  return new ApiError(err.statusCode || 500, err.statusCode ? err.message : 'Something went wrong');
}

export default errorMiddleware;
