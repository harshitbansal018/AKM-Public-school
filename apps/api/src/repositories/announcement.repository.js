import { prisma } from '../config/prisma.js';

/**
 * Ticker lines that are active *right now* — a line can be scheduled with
 * startsAt/endsAt, so "Admissions open" can appear and retire on its own.
 */
export function findActive() {
  const now = new Date();
  return prisma.announcement.findMany({
    where: {
      isActive: true,
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      ],
    },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  });
}

export function findAll() {
  return prisma.announcement.findMany({ orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] });
}

export function findById(id) {
  return prisma.announcement.findUnique({ where: { id: Number(id) } });
}

export function create(data) {
  return prisma.announcement.create({ data });
}

export function update(id, data) {
  return prisma.announcement.update({ where: { id: Number(id) }, data });
}

export function remove(id) {
  return prisma.announcement.delete({ where: { id: Number(id) } });
}

export function reorder(orderedIds) {
  return prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.announcement.update({ where: { id: Number(id) }, data: { sortOrder: index } })
    )
  );
}
