/**
 * Low-level fetch wrapper for the Express API.
 *
 * Every endpoint answers in one envelope:
 *   { success, message, data, meta }
 *
 * `apiFetch` unwraps `data` and throws an ApiClientError on failure, so callers
 * only ever deal with the payload itself.
 */

/**
 * What the browser calls. Everything is served from one origin, so this is a
 * relative path — no domain, no CORS, and it keeps working when the site moves
 * from localhost to the real domain.
 */
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || '/api/v1').replace(/\/$/, '');

/**
 * What server components call.
 *
 * Node's fetch cannot resolve a relative URL — `fetch('/api/v1/home')` throws
 * "Failed to parse URL". Server-side requests therefore need an absolute
 * address, and since the API lives in this same process the shortest route is
 * straight back to localhost rather than out through the public domain.
 */
const INTERNAL_API_URL = (
  process.env.INTERNAL_API_URL || `http://127.0.0.1:${process.env.PORT || 3000}/api/v1`
).replace(/\/$/, '');

const isServer = typeof window === 'undefined';

/** Base for the current environment. */
export const baseUrl = () => (isServer ? INTERNAL_API_URL : API_URL);

/** The site always has an API now that both run in one process. */
export const API_ENABLED = true;

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
  const { tags, revalidate = 60, headers, ...rest } = options;

  const res = await fetch(`${baseUrl()}${path}`, {
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
