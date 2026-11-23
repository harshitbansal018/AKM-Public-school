import { prisma } from '../config/prisma.js';

export const AUDIT_RETENTION_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

export function retentionCutoff(now = new Date()) {
  return new Date(now.getTime() - AUDIT_RETENTION_DAYS * DAY_MS);
}

/**
 * Keeps a rolling 30-day window without a session, cron or extra scheduler.
 * Cleanup and insert are atomic: if either query fails, neither is committed.
 */
export function create(data) {
  const cutoff = retentionCutoff();
  return prisma.$transaction(async (transaction) => {
    await transaction.auditLog.deleteMany({ where: { createdAt: { lt: cutoff } } });
    return transaction.auditLog.create({ data });
  });
}

export function findPaged(where, { skip = 0, take = 25 } = {}) {
  return prisma.auditLog.findMany({ where, orderBy: { id: 'desc' }, skip, take });
}

export function count(where = {}) {
  return prisma.auditLog.count({ where });
}

export function findWhere(where, { take } = {}) {
  return prisma.auditLog.findMany({ where, orderBy: { id: 'desc' }, take });
}
