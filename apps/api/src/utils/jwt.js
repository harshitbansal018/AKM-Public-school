import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from './ApiError.js';

/**
 * Two tokens, on purpose:
 *   access  — short-lived, sent in the Authorization header on every request
 *   refresh — long-lived, stored as an httpOnly cookie the browser cannot read
 *
 * If an access token leaks it expires in minutes; the refresh token is never
 * exposed to JavaScript, so XSS cannot steal a long-lived session.
 *
 * `kind` says which table the subject id belongs to — 'user' (admin panel),
 * 'faculty' (teacher portal) or 'parent' (parent portal). Every table starts
 * its ids at 1, so a token without it could be replayed against another
 * portal's routes.
 */
export const TOKEN_KIND = { USER: 'user', FACULTY: 'faculty', PARENT: 'parent' };

export function signAccessToken(user, kind = TOKEN_KIND.USER) {
  return jwt.sign({ sub: user.id, role: user.role, email: user.email, kind }, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpires,
  });
}

export function signRefreshToken(user, kind = TOKEN_KIND.USER) {
  return jwt.sign({ sub: user.id, type: 'refresh', kind }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpires,
  });
}

export function verifyAccessToken(token, kind = TOKEN_KIND.USER) {
  let payload;
  try {
    payload = jwt.verify(token, env.jwt.accessSecret);
  } catch (error) {
    throw ApiError.unauthorized(
      error.name === 'TokenExpiredError' ? 'Session expired' : 'Invalid token'
    );
  }
  // Tokens issued before `kind` existed carry none and are admin tokens.
  if ((payload.kind ?? TOKEN_KIND.USER) !== kind) throw ApiError.unauthorized('Invalid token');
  return payload;
}

export function verifyRefreshToken(token, kind = TOKEN_KIND.USER) {
  let payload;
  try {
    payload = jwt.verify(token, env.jwt.refreshSecret);
  } catch {
    throw ApiError.unauthorized('Your session has expired — please sign in again');
  }
  if ((payload.kind ?? TOKEN_KIND.USER) !== kind) {
    throw ApiError.unauthorized('Your session has expired — please sign in again');
  }
  return payload;
}

export default { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken };
