/**
 * Authenticated client for the admin panel and the teacher portal.
 *
 * Attaches the bearer token, and on a 401 tries one silent refresh before
 * giving up — so a working session is never interrupted just because the
 * short-lived access token expired mid-click.
 */

import { API_URL, API_ENABLED, ApiClientError } from './api';
import { getAccessToken, setAccessToken, clearSession } from './auth';

async function request(path, options = {}, isRetry = false, portal = 'admin') {
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
    const refreshed = await refreshSession(portal);
    if (refreshed) return request(path, options, true, portal);
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
async function refreshSession(portal = 'admin') {
  try {
    const res = await fetch(`${API_URL}/${portal}/auth/refresh`, {
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

/**
 * The admin panel and the teacher portal talk to different auth routes but are
 * otherwise the same client, so one factory builds both.
 */
export function portalApi(portal = 'admin') {
  const call = (path, options) => request(path, options, false, portal);
  return {
    get: (path) => call(path),
    post: (path, body) => call(path, { method: 'POST', body }),
    put: (path, body) => call(path, { method: 'PUT', body }),
    patch: (path, body) => call(path, { method: 'PATCH', body }),
    delete: (path) => call(path, { method: 'DELETE' }),
    upload: (path, formData) => call(path, { method: 'POST', body: formData }),
    /**
     * Saves a file from an authenticated route (a CSV export, a CV). The route
     * needs the bearer token, so it cannot be a plain <a href>: fetch it, then
     * hand the browser a blob to save under `filename`.
     */
    async download(path, filename) {
      const res = await fetch(`${API_URL}${path}`, {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
        credentials: 'include',
      });
      if (!res.ok) throw new ApiClientError('Download failed', res.status);
      const url = URL.createObjectURL(await res.blob());
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    },
  };
}

export const adminApi = portalApi('admin');
export const teacherApi = portalApi('teacher');

export default adminApi;
