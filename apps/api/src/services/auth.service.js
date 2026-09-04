import { userRepository } from '../repositories/index.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { serializeUser } from '../serializers/index.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Sign in.
 *
 * A wrong email and a wrong password return the identical message on purpose —
 * distinguishing them would let someone enumerate which staff accounts exist.
 */
export async function login(email, password) {
  const user = await userRepository.findByEmail(email);
  const failure = ApiError.unauthorized('Incorrect email or password');

  if (!user) {
    // Hash anyway so a missing account does not answer measurably faster.
    await hashPassword(password);
    throw failure;
  }

  const matches = await verifyPassword(password, user.passwordHash);
  if (!matches) throw failure;
  if (!user.isActive) throw ApiError.forbidden('That account has been deactivated');

  await userRepository.touchLastLogin(user.id);

  return {
    user: serializeUser(user),
    accessToken: signAccessToken(user),
    refreshToken: signRefreshToken(user),
  };
}

/** Exchanges a valid refresh token for a new access token. */
export async function refresh(refreshToken) {
  if (!refreshToken) throw ApiError.unauthorized('Please sign in again');

  const payload = verifyRefreshToken(refreshToken);
  const user = await userRepository.findById(payload.sub);

  if (!user || !user.isActive) throw ApiError.unauthorized('Please sign in again');

  return {
    user: serializeUser(user),
    accessToken: signAccessToken(user),
  };
}

export async function changePassword(userId, currentPassword, newPassword) {
  const user = await userRepository.findById(userId);
  if (!user) throw ApiError.notFound('Account not found');

  const matches = await verifyPassword(currentPassword, user.passwordHash);
  if (!matches) throw ApiError.badRequest('Your current password is not correct');

  await userRepository.update(userId, { passwordHash: await hashPassword(newPassword) });
  return { changed: true };
}
