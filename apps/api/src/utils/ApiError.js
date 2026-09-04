/**
 * An error with an HTTP status attached.
 *
 * Anything thrown as an ApiError is treated as expected — the error middleware
 * reports its message to the client verbatim. Every other thrown value is
 * treated as a bug and reported generically.
 */
export class ApiError extends Error {
  constructor(statusCode, message, errors = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad request', errors = null) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Authentication required') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'You do not have permission to do that') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Not found') {
    return new ApiError(404, message);
  }

  static conflict(message = 'That already exists') {
    return new ApiError(409, message);
  }

  static tooMany(message = 'Too many requests — please try again later') {
    return new ApiError(429, message);
  }

  static internal(message = 'Something went wrong') {
    return new ApiError(500, message);
  }
}

export default ApiError;
