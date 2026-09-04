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
 */
export function signAccessToken(user) {
  return jwt.sign({ sub: user.id, role: user.role, email: user.email }, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpires,
  });
}

export function signRefreshToken(user) {
  return jwt.sign({ sub: user.id, type: 'refresh' }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpires,
  });
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, env.jwt.accessSecret);
  } catch (error) {
    throw ApiError.unauthorized(
      error.name === 'TokenExpiredError' ? 'Session expired' : 'Invalid token'
    );
  }
}

export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, env.jwt.refreshSecret);
  } catch {
    throw ApiError.unauthorized('Your session has expired — please sign in again');
  }
}

export default { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken };
