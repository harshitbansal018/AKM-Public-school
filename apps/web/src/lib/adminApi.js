/**
 * Authenticated client for the admin panel.
 *
 * Attaches the bearer token, and on a 401 tries one silent refresh before
 * giving up — so a working session is never interrupted just because the
 * short-lived access token expired mid-click.
 */

import { API_URL, API_ENABLED, ApiClientError } from './api';
import { getAccessToken, setAccessToken, clearSession } from './auth';

async function request(path, options = {}, isRetry = false) {
  if (!API_ENABLED) {
    throw new ApiClientError('API not configured — the backend is not built yet', 0);
  }

  const { body, headers, ...rest } = options;
  const token = getAccessToken();
  const isFormData = body instanceof FormData;

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    credentials: 'include', // refresh token travels as an httpOnly cookie
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  if (res.status === 401 && !isRetry) {
    const refreshed = await refreshSession();
    if (refreshed) return request(path, options, true);
    clearSession();
    throw new ApiClientError('Your session expired — please sign in again', 401);
  }

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    // no JSON body
  }

  if (!res.ok || payload?.success === false) {
    throw new ApiClientError(
      payload?.message || `Request failed with status ${res.status}`,
      res.status,
      payload?.errors
    );
  }

  return payload?.data ?? payload;
}

/** Exchanges the refresh cookie for a fresh access token. */
async function refreshSession() {
  try {
    const res = await fetch(`${API_URL}/admin/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) return false;
    const payload = await res.json();
    const token = payload?.data?.accessToken;
    if (!token) return false;
    setAccessToken(token);
    return true;
  } catch {
    return false;
  }
}

export const adminApi = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
  upload: (path, formData) => request(path, { method: 'POST', body: formData }),
};

export default adminApi;
