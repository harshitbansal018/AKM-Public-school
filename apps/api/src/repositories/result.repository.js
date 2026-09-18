import { prisma } from '../config/prisma.js';
import { createRepository } from './createRepository.js';

/**
 * Results: the standard list/CRUD plus the marks-grid save, which writes a
 * whole class's marks for one examination in a single transaction.
 */
const base = createRepository('result', { orderBy: [{ resultDate: 'desc' }, { id: 'desc' }] });

export const { findPublished, findAll, findById, findWhere, findFirst, create, update, remove, count } = base;

/** The distinct examination names a class has results for, newest first. */
export async function listExams(classGroup) {
  const rows = await prisma.result.groupBy({
    by: ['exam'],
    where: { classGroup },
    _max: { resultDate: true, id: true },
    orderBy: [{ _max: { resultDate: 'desc' } }, { _max: { id: 'desc' } }],
  });
  return rows.map((row) => row.exam);
}

/** How many examinations a student has (published) results for. */
export async function countExams(where) {
  const rows = await prisma.result.groupBy({ by: ['exam'], where });
  return rows.length;
}

/**
 * Upserts one row per (student, exam, subject). `rows` already carry every
 * column; a row whose `id` is set is updated, the rest are created, and the
 * ids listed in `removeIds` (cells that were cleared) are deleted.
 */
export function saveGrid({ rows, removeIds = [] }) {
  return prisma.$transaction([
    ...(removeIds.length ? [prisma.result.deleteMany({ where: { id: { in: removeIds } } })] : []),
    ...rows.map(({ id, ...data }) =>
      id ? prisma.result.update({ where: { id }, data }) : prisma.result.create({ data })
    ),
  ]);
}
