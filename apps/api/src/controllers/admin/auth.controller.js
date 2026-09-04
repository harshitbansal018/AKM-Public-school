import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendOk } from '../../utils/ApiResponse.js';
import { serializeUser } from '../../serializers/index.js';
import * as authService from '../../services/auth.service.js';
import { env } from '../../config/env.js';

const REFRESH_COOKIE = 'akm_refresh';

/**
 * httpOnly so JavaScript cannot read it (XSS cannot steal the session).
 * sameSite=lax so it survives normal navigation but not cross-site POSTs.
 * Scoped to the refresh path so it is not sent on every ordinary request.
 */
const cookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: 'lax',
  path: `${env.apiPrefix}/admin/auth`,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(
    req.body.email,
    req.body.password
  );

  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);
  sendOk(res, { user, accessToken }, 'Signed in');
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  const { user, accessToken } = await authService.refresh(token);
  sendOk(res, { user, accessToken }, 'Session refreshed');
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie(REFRESH_COOKIE, { ...cookieOptions, maxAge: undefined });
  sendOk(res, { loggedOut: true }, 'Signed out');
});

export const me = asyncHandler(async (req, res) => {
  sendOk(res, serializeUser(req.user), 'Current user');
});

export const changePassword = asyncHandler(async (req, res) => {
  const result = await authService.changePassword(
    req.user.id,
    req.body.currentPassword,
    req.body.newPassword
  );
  sendOk(res, result, 'Password updated');
});
