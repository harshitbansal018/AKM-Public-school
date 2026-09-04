import { env } from './env.js';

/**
 * Allow-list rather than a wildcard, because the admin panel sends credentials
 * (the refresh cookie) — and browsers refuse credentialed requests to `*`.
 *
 * Requests with no Origin (curl, health checks, server-to-server) are allowed.
 */
/** http://localhost:3002, http://127.0.0.1:5173, … — any port, dev only. */
const LOCALHOST = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

export const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
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
