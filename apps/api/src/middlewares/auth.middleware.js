import { verifyAccessToken } from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as userRepository from '../repositories/user.repository.js';

/**
 * Verifies the bearer token and attaches the live user to req.user.
 *
 * The user is re-read from the database rather than trusted from the token, so
 * deactivating an account takes effect immediately instead of when their token
 * happens to expire.
 */
export const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;

  if (!token) throw ApiError.unauthorized('Please sign in to continue');

  const payload = verifyAccessToken(token);
  const user = await userRepository.findById(payload.sub);

  if (!user) throw ApiError.unauthorized('That account no longer exists');
  if (!user.isActive) throw ApiError.forbidden('That account has been deactivated');

  req.user = user;
  next();
});

export default authenticate;
