import { verifyAccessToken, TOKEN_KIND } from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { loadAccount } from '../services/auth.service.js';

/**
 * Verifies a bearer token of one account kind and attaches the live account
 * to req.user. A token from another portal is rejected outright — its subject
 * id belongs to a different table.
 */
function createAuthenticator(kind) {
  return asyncHandler(async (req, _res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;
    if (!token) throw ApiError.unauthorized('Please sign in to continue');

    const payload = verifyAccessToken(token, kind);
    req.user = await loadAccount(kind, payload.sub);
    next();
  });
}

/** Admin panel (User accounts). */
export const authenticate = createAuthenticator(TOKEN_KIND.USER);
/** Teacher portal (Faculty rows with portal access). */
export const authenticateTeacher = createAuthenticator(TOKEN_KIND.FACULTY);
/** Parent portal (Parent accounts). */
export const authenticateParent = createAuthenticator(TOKEN_KIND.PARENT);

export default authenticate;
