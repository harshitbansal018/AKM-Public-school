import { prisma } from '../config/prisma.js';

/** Append-only: there is deliberately no update or delete here. */

export function create(data) {
  return prisma.auditLog.create({ data });
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
