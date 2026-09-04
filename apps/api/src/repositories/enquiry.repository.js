import { prisma } from '../config/prisma.js';

export function create(data) {
  return prisma.enquiry.create({ data });
}

export async function findPaged({ skip, take, status, search } = {}) {
  const where = {
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { parentName: { contains: search } },
            { studentName: { contains: search } },
            { phone: { contains: search } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.enquiry.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
    prisma.enquiry.count({ where }),
  ]);

  return { items, total };
}

export function findById(id) {
  return prisma.enquiry.findUnique({ where: { id: Number(id) } });
}

export function update(id, data) {
  return prisma.enquiry.update({ where: { id: Number(id) }, data });
}

export function remove(id) {
  return prisma.enquiry.delete({ where: { id: Number(id) } });
}

/** Unfiltered export for the CSV download. */
export function findAllForExport() {
  return prisma.enquiry.findMany({ orderBy: { createdAt: 'desc' } });
}

export function countByStatus(status) {
  return prisma.enquiry.count({ where: { status } });
}

export function countAll() {
  return prisma.enquiry.count();
}

/**
 * How many enquiries this phone number has sent recently.
 * Backs the duplicate check — the same parent submitting twice in a minute is
 * a double-click, not two enquiries.
 */
export function countRecentFromPhone(phone, sinceMinutes = 10) {
  const since = new Date(Date.now() - sinceMinutes * 60 * 1000);
  return prisma.enquiry.count({ where: { phone, createdAt: { gte: since } } });
}
