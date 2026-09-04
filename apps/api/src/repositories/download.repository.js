import { prisma } from '../config/prisma.js';

export function findPublic(category) {
  return prisma.download.findMany({
    where: { isPublic: true, ...(category ? { category } : {}) },
    orderBy: { createdAt: 'desc' },
  });
}

export function findAll() {
  return prisma.download.findMany({ orderBy: { createdAt: 'desc' } });
}

export function findById(id) {
  return prisma.download.findUnique({ where: { id: Number(id) } });
}

export function create(data) {
  return prisma.download.create({ data });
}

export function update(id, data) {
  return prisma.download.update({ where: { id: Number(id) }, data });
}

export function remove(id) {
  return prisma.download.delete({ where: { id: Number(id) } });
}

/** Fire-and-forget so a counter failure never blocks the file download. */
export function incrementCount(id) {
  return prisma.download
    .update({ where: { id: Number(id) }, data: { downloadCount: { increment: 1 } } })
    .catch(() => null);
}
