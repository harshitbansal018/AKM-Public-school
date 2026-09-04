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

const app = express();

/**
 * Order matters here. Security and parsing first, then routes, then the
 * not-found and error handlers last — Express runs middleware in the order it
 * is registered, so an error handler declared early would never see anything.
 */

// Behind a reverse proxy in production, so req.ip reflects the real client
// rather than the proxy — which is what the rate limiter keys on.
app.set('trust proxy', env.isProduction ? 1 : false);
app.disable('x-powered-by');

app.use(
  helmet({
    // Uploads are served to a different origin (the Next.js app), which the
    // default same-origin policy would block.
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  })
);

app.use(cors(corsOptions));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use(requestLogger);

// Uploaded images and documents.
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
    data: { uptime: Math.round(process.uptime()), env: env.nodeEnv },
  });
});

app.use(env.apiPrefix, generalLimiter, routes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
