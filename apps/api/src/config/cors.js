import { env } from './env.js';

/**
 * Allow-list rather than a wildcard, because the admin panel sends credentials
 * (the refresh cookie) — and browsers refuse credentialed requests to `*`.
 *
 * Requests with no Origin (curl, health checks, server-to-server) are allowed.
 */

/** http://localhost:3002, http://127.0.0.1:5173, … — any port, dev only. */
const LOCALHOST = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

/**
 * The site's own address, taken from PUBLIC_BASE_URL.
 *
 * The website and the API are one process on one origin, so a request from the
 * site to itself must always be allowed. Browsers still send an Origin header
 * on same-origin POSTs, so without this the server rejects its own admin panel
 * with "Origin not allowed by CORS" — and the only symptom a user sees is
 * "Something went wrong" on sign-in.
 */
const selfOrigin = (() => {
  try {
    return new URL(env.publicBaseUrl).origin;
  } catch {
    return null;
  }
})();

export const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (origin === selfOrigin) return callback(null, true);
    if (env.corsOrigins.includes(origin)) return callback(null, true);

    // In development the frontend hops ports whenever one is taken (3000 → 3001
    // → 3002), so pinning an exact list just produces confusing CORS failures.
    // Production stays strictly allow-listed.
    if (!env.isProduction && LOCALHOST.test(origin)) return callback(null, true);

    return callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
};

export default corsOptions;
