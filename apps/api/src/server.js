import path from 'node:path';
import { fileURLToPath } from 'node:url';
import next from 'next';

import { createApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';
import { logger } from './utils/logger.js';

const here = path.dirname(fileURLToPath(import.meta.url)); // apps/api/src
const webDir = path.resolve(here, '../../web'); // apps/web

/**
 * One server, one port.
 *
 * Next.js is used as a library rather than as its own server: prepare() builds
 * it, getRequestHandler() returns a plain function, and Express calls that
 * function for anything that is not the API or an upload. So Next never opens
 * a port of its own — there is a single process listening on env.port.
 *
 * Routing, in order:
 *   /uploads/*   → files on disk
 *   /api/v1/*    → this API
 *   everything   → Next.js (pages, /api/revalidate, assets, 404)
 */
async function start() {
  // 1. Database first — a bad DATABASE_URL should fail at boot, not on the
  //    first visitor's request.
  try {
    await prisma.$connect();
    logger.success('Database connected');
  } catch (error) {
    logger.error('Could not connect to the database.');
    logger.error(error.message);
    logger.info('Check DATABASE_URL in apps/api/.env, and that MySQL is running.');
    process.exit(1);
  }

  // 2. Build the frontend handler.
  const dev = !env.isProduction;
  const nextApp = next({ dev, dir: webDir });

  logger.info(`Preparing the website (${dev ? 'development' : 'production'})…`);
  try {
    await nextApp.prepare();
  } catch (error) {
    logger.error('Next.js failed to start.');
    logger.error(error.message);
    if (env.isProduction) {
      logger.info('Run "npm run build" before starting in production.');
    }
    process.exit(1);
  }
  logger.success('Website ready');

  // 3. One Express app serving both.
  const app = createApp({ nextHandler: nextApp.getRequestHandler() });

  const server = app.listen(env.port, () => {
    logger.success(`Running on http://localhost:${env.port}`);
    logger.info(`Website:  http://localhost:${env.port}`);
    logger.info(`API:      http://localhost:${env.port}${env.apiPrefix}`);
    logger.info(`Admin:    http://localhost:${env.port}/admin/login`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      logger.error(`Port ${env.port} is already in use. Set PORT in apps/api/.env.`);
      process.exit(1);
    }
    throw error;
  });

  /** Finish in-flight requests before exiting, then close the DB pool. */
  const shutdown = (signal) => {
    logger.warn(`${signal} received — shutting down`);
    server.close(async () => {
      await prisma.$disconnect();
      logger.info('Closed cleanly');
      process.exit(0);
    });
    // Do not hang forever on a stuck connection.
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection:', reason);
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception:', error);
    process.exit(1);
  });
}

start();
