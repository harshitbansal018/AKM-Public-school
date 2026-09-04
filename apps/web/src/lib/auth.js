/**
 * Access-token storage for the admin panel.
 *
 * The short-lived access token is held in memory, with a sessionStorage mirror
 * so a page refresh does not sign the user out. The long-lived refresh token is
 * an httpOnly cookie set by the API and is never readable from JavaScript.
 */

const STORAGE_KEY = 'akm.admin.token';
const USER_KEY = 'akm.admin.user';

let accessToken = null;

export function getAccessToken() {
  if (accessToken) return accessToken;
  if (typeof window === 'undefined') return null;
  try {
    accessToken = window.sessionStorage.getItem(STORAGE_KEY);
  } catch {
    accessToken = null;
  }
  return accessToken;
}

export function setAccessToken(token) {
  accessToken = token;
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, token);
  } catch {
    // private browsing — in-memory token still works for this tab
  }
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // ignore
  }
}

export function clearSession() {
  accessToken = null;
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
    window.sessionStorage.removeItem(USER_KEY);
  } catch {
    // ignore
  }
}

export function isAuthenticated() {
  return Boolean(getAccessToken());
}
