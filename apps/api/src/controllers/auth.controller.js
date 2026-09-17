import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOk } from '../utils/ApiResponse.js';
import * as authService from '../services/auth.service.js';
import { env } from '../config/env.js';

/**
 * login / refresh / logout / me for one portal.
 *
 * The refresh token is an httpOnly cookie (JavaScript cannot read it, so XSS
 * cannot steal the session), sameSite=lax (survives navigation, not cross-site
 * POSTs), and scoped to this portal's refresh path — so an admin and a parent
 * signed in on the same browser never overwrite each other's cookie.
 *
 * @param {object} options
 * @param {string} options.kind    account kind (TOKEN_KIND.*)
 * @param {string} options.portal  URL segment: 'admin' | 'teacher' | 'parent'
 * @param {string} options.cookie  refresh-cookie name
 */
export function createAuthController({ kind, portal, cookie }) {
  const cookieOptions = {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'lax',
    path: `${env.apiPrefix}/${portal}/auth`,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  return {
    login: asyncHandler(async (req, res) => {
      const { user, accessToken, refreshToken } = await authService.login(
        kind,
        req.body.email,
        req.body.password
      );
      res.cookie(cookie, refreshToken, cookieOptions);
      sendOk(res, { user, accessToken }, 'Signed in');
    }),

    refresh: asyncHandler(async (req, res) => {
      const { user, accessToken } = await authService.refresh(kind, req.cookies?.[cookie]);
      sendOk(res, { user, accessToken }, 'Session refreshed');
    }),

    logout: asyncHandler(async (_req, res) => {
      res.clearCookie(cookie, { ...cookieOptions, maxAge: undefined });
      sendOk(res, { loggedOut: true }, 'Signed out');
    }),

    me: asyncHandler(async (req, res) => {
      sendOk(res, authService.serializeAccount(kind, req.user), 'Current account');
    }),
  };
}

/** Admin-panel users change their own password; teachers and parents ask the office. */
export const changePassword = asyncHandler(async (req, res) => {
  const result = await authService.changePassword(
    req.user.id,
    req.body.currentPassword,
    req.body.newPassword
  );
  sendOk(res, result, 'Password updated');
});
