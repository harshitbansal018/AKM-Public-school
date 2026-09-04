import { ApiError } from '../utils/ApiError.js';

/**
 * Restricts a route to the listed roles.
 * Always mounted after `authenticate`, which is what sets req.user.
 *
 *   router.delete('/:id', authenticate, requireRole('ADMIN'), handler)
 */
export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized('Please sign in to continue'));
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('Only an administrator can do that'));
    }
    return next();
  };
}

export default requireRole;
