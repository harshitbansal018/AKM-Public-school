/**
 * Low-level fetch wrapper for the Express API.
 *
 * Every endpoint answers in one envelope:
 *   { success, message, data, meta }
 *
 * `apiFetch` unwraps `data` and throws an ApiClientError on failure, so callers
 * only ever deal with the payload itself.
 */

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

/** True when no backend is configured — the site then runs on bundled content. */
export const API_ENABLED = Boolean(API_URL);

export class ApiClientError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.details = details;
  }
}

/**
 * @param {string} path      e.g. '/notices?page=2'
 * @param {object} [options] standard fetch options plus:
 *   @param {string[]} [options.tags]     Next.js cache tags for revalidation
 *   @param {number}  [options.revalidate] seconds; defaults to 60
 */
export async function apiFetch(path, options = {}) {
  if (!API_ENABLED) {
    throw new ApiClientError('API not configured', 0);
  }

  const { tags, revalidate = 60, headers, ...rest } = options;

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    next: { revalidate, ...(tags ? { tags } : {}) },
  });

  let body = null;
  try {
    body = await res.json();
  } catch {
    // non-JSON response — leave body null
  }

  if (!res.ok || body?.success === false) {
    throw new ApiClientError(
      body?.message || `Request failed with status ${res.status}`,
      res.status,
      body?.errors
    );
  }

  return body?.data ?? body;
}

/** POST helper for public form submissions. */
export async function apiPost(path, payload) {
  return apiFetch(path, {
    method: 'POST',
    body: JSON.stringify(payload),
    cache: 'no-store',
    revalidate: 0,
  });
}
