import path from 'node:path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';

import { env } from './config/env.js';
import { corsOptions } from './config/cors.js';
import routes from './routes/index.js';
import { requestLogger } from './middlewares/requestLogger.middleware.js';
import { generalLimiter } from './middlewares/rateLimit.middleware.js';
import { notFoundMiddleware } from './middlewares/notFound.middleware.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

/**
 * Builds the Express app.
 *
 * Pass `nextHandler` and this single server also serves the website — one
 * process on one port. Leave it out and it is an API-only server, with Next.js
 * running separately.
 *
 * Order matters throughout: Express matches middleware top to bottom and the
 * first match wins, so the API prefix is registered before the catch-all that
 * hands everything else to Next.
 *
 * @param {{ nextHandler?: Function }} [options]
 */
export function createApp({ nextHandler } = {}) {
  const app = express();

  // Behind a reverse proxy in production, so req.ip reflects the real client
  // rather than the proxy — which is what the rate limiter keys on.
  app.set('trust proxy', env.isProduction ? 1 : false);
  app.disable('x-powered-by');

  app.use(
    helmet({
      // Uploads may be served to a different origin in development.
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      // Next.js sets its own CSP-sensitive inline scripts; leaving this on
      // would block the website from hydrating.
      contentSecurityPolicy: false,
    })
  );

  app.use(cors(corsOptions));
  app.use(compression());
  app.use(cookieParser());
  app.use(requestLogger);

  /**
   * Body parsing is mounted on the API path only, never globally.
   *
   * A parser reads the request stream to the end. If it runs on a request bound
   * for Next.js, Next's own route handlers get an already-consumed body and
   * fail with "Response body object should not be disturbed or locked" — which
   * is exactly what broke /api/revalidate.
   */
  const parseBody = [
    express.json({ limit: '1mb' }),
    express.urlencoded({ extended: true, limit: '1mb' }),
  ];

  // ---- 1. uploaded images and documents ----
  app.use(
    `/${env.uploadDir}`,
    express.static(path.resolve(process.cwd(), env.uploadDir), {
      maxAge: env.isProduction ? '30d' : 0,
      // Files here are user-uploaded; never let one be interpreted as a script.
      setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
    })
  );

  /** Liveness probe — deliberately outside the API prefix and the rate limiter. */
  app.get('/health', (_req, res) => {
    res.json({
      success: true,
      message: 'API is running',
      data: {
        uptime: Math.round(process.uptime()),
        env: env.nodeEnv,
        servingFrontend: Boolean(nextHandler),
      },
    });
  });

  // ---- 2. the API ----
  app.use(env.apiPrefix, parseBody, generalLimiter, routes);

  // ---- 3. everything else ----
  if (nextHandler) {
    // Pages, Next's own /api/revalidate route, static assets and its 404 page.
    app.all('*', (req, res) => nextHandler(req, res));
  } else {
    // API-only mode: anything unmatched really is a missing endpoint.
    app.use(notFoundMiddleware);
  }

  app.use(errorMiddleware);

  return app;
}

export default createApp;
