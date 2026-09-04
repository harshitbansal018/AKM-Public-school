import { ApiError } from '../utils/ApiError.js';

/** Runs after every route; anything reaching here matched nothing. */
export function notFoundMiddleware(req, _res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

export default notFoundMiddleware;
