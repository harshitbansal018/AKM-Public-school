import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';
import { logger } from './utils/logger.js';

/**
 * Boot sequence: prove the database is reachable *before* accepting traffic,
 * so a bad DATABASE_URL fails immediately at startup instead of surfacing as
 * a 500 on the first visitor's request.
 */
async function start() {
  try {
    await prisma.$connect();
    logger.success('Database connected');
  } catch (error) {
    logger.error('Could not connect to the database.');
    logger.error(error.message);
    logger.info('Check DATABASE_URL in apps/api/.env, and that MySQL is running.');
    process.exit(1);
  }

  const server = app.listen(env.port, () => {
    logger.success(`API listening on http://localhost:${env.port}`);
    logger.info(`Base path: ${env.apiPrefix}`);
    logger.info(`Health:    http://localhost:${env.port}/health`);
    logger.info(`CORS:      ${env.corsOrigins.join(', ')}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      logger.error(`Port ${env.port} is already in use. Set PORT in apps/api/.env.`);
      process.exit(1);
    }
    throw error;
  });

  /** Finish in-flight requests before exiting, then close the DB pool. */
  const shutdown = async (signal) => {
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
