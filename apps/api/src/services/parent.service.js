/**
 * What a signed-in parent may read: their linked children, and for each child
 * the class's homework, the child's published results and fee history.
 *
 * Every query starts from the child, and every child is checked against the
 * parent's id — a parent can never reach another student's records, whatever
 * id they put in the URL.
 */
import {
  studentRepository,
  homeworkRepository,
  resultRepository,
  feeRecordRepository,
} from '../repositories/index.js';
import { ApiError } from '../utils/ApiError.js';

const money = (value) => Math.round(Number(value ?? 0) * 100) / 100;

/** Paid / pending / outstanding totals across a child's fee records. */
function summariseFees(records) {
  const summary = { total: 0, paid: 0, outstanding: 0, pendingCount: 0 };
  for (const fee of records) {
    const amount = money(fee.amount);
    const paid = money(fee.paidAmount);
    summary.total += amount;
    summary.paid += paid;
    summary.outstanding += Math.max(amount - paid, 0);
    if (fee.status !== 'PAID') summary.pendingCount += 1;
  }
  return {
    total: money(summary.total),
    paid: money(summary.paid),
    outstanding: money(summary.outstanding),
    pendingCount: summary.pendingCount,
  };
}

/** The child, only if it is linked to this parent. */
export async function getChild(parent, studentId) {
  const student = await studentRepository.findById(studentId);
  if (!student) throw ApiError.notFound('Student not found');
  if (student.parentId !== parent.id) {
    throw ApiError.forbidden('You can only view your own children');
  }
  return student;
}

/** Dashboard: each linked child with a one-line summary. */
export async function listChildren(parent) {
  const children = await studentRepository.findWhere({ parentId: parent.id });

  return Promise.all(
    children.map(async (child) => {
      const [homeworkCount, resultCount, fees] = await Promise.all([
        homeworkRepository.count({ classGroup: child.classGroup, isPublished: true }),
        resultRepository.count({ studentId: child.id, isPublished: true }),
        feeRecordRepository.findWhere({ studentId: child.id }),
      ]);
      return {
        id: child.id,
        name: child.name,
        classGroup: child.classGroup,
        rollNumber: child.rollNumber,
        homeworkCount,
        resultCount,
        fees: summariseFees(fees),
      };
    })
  );
}

/** One child's page: profile, homework for their class, results, fees. */
export async function getChildDetail(parent, studentId) {
  const child = await getChild(parent, studentId);

  const [homework, results, fees] = await Promise.all([
    homeworkRepository.findWhere({ classGroup: child.classGroup, isPublished: true }),
    resultRepository.findWhere({ studentId: child.id, isPublished: true }),
    feeRecordRepository.findWhere({ studentId: child.id }),
  ]);

  return {
    student: {
      id: child.id,
      name: child.name,
      classGroup: child.classGroup,
      rollNumber: child.rollNumber,
    },
    homework,
    results,
    fees: { summary: summariseFees(fees), records: fees },
  };
}
