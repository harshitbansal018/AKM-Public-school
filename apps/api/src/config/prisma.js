import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

/**
 * A single PrismaClient for the whole process.
 *
 * Cached on globalThis so nodemon restarts reuse the same instance instead of
 * opening a new connection pool on every reload and eventually exhausting
 * MySQL's max_connections.
 */
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.__akmPrisma ??
  new PrismaClient({
    log: env.isProduction ? ['error'] : ['warn', 'error'],
  });

if (!env.isProduction) {
  globalForPrisma.__akmPrisma = prisma;
}

export default prisma;
