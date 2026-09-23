/**
 * Results are stored one row per student, examination and subject. This
 * module owns the two things that make that workable: deriving the displayed
 * `score` from the numbers, and the marks grid (a whole class × subjects for
 * one exam, loaded and saved in one go).
 */
import { resultRepository, studentRepository } from '../repositories/index.js';
import { resolveClassGroup, normaliseSubject } from './setting.service.js';
import { withStudent } from './internalRecords.service.js';
import { ApiError } from '../utils/ApiError.js';
import * as audit from './audit.service.js';

const num = (value) => (value === null || value === undefined ? null : Number(value));
const key = (value) => String(value ?? '').trim().toLowerCase();

/** "87.5 / 100", "87 / 100", or just "87" when there is no maximum. */
export function formatScore(marks, maxMarks) {
  if (marks === null || marks === undefined) return '';
  const show = (n) => String(Number(n));
  return maxMarks === null || maxMarks === undefined ? show(marks) : `${show(marks)} / ${show(maxMarks)}`;
}

/**
 * Single-row create/update. Snaps the subject to the configured spelling and
 * derives `score` from marks / maxMarks whenever marks are known (an update
 * that changes only the marks still gets a fresh score).
 */
export async function prepareResult(input, existing) {
  const data = await withStudent(input);
  if (data.subject !== undefined) data.subject = data.subject ? await normaliseSubject(data.subject) : null;

  const marks = data.marks !== undefined ? data.marks : num(existing?.marks);
  const maxMarks = data.maxMarks !== undefined ? data.maxMarks : num(existing?.maxMarks);
  if (marks !== null && maxMarks !== null && marks > maxMarks) {
    throw ApiError.badRequest('Marks cannot exceed the maximum');
  }
  if (marks !== null) data.score = formatScore(marks, maxMarks);
  else if (!data.score && !existing?.score) throw ApiError.badRequest('Enter the marks or a score');
  return data;
}

/**
 * Everything the grid needs for one class: its students, the exams it already
 * has results for and — when an exam is named — the subjects and marks saved
 * so far, so the grid opens pre-filled and can be corrected.
 */
export async function loadMarksGrid({ classGroup: rawClass, exam }) {
  const classGroup = await resolveClassGroup(rawClass);
  const [students, exams] = await Promise.all([
    studentRepository.findWhere({ classGroup }),
    resultRepository.listExams(classGroup),
  ]);

  const rows = exam ? await resultRepository.findWhere({ classGroup, exam, studentId: { not: null } }) : [];

  // Subjects in the order they were first saved, each with its max marks.
  const subjects = [];
  const entries = {};
  let isPublished = rows.length > 0;
  let resultDate = null;
  for (const row of rows) {
    const name = row.subject ?? 'Overall';
    if (!subjects.some((s) => s.name === name)) subjects.push({ name, maxMarks: num(row.maxMarks) });
    (entries[row.studentId] ||= {})[name] = num(row.marks);
    if (!row.isPublished) isPublished = false;
    resultDate ||= row.resultDate;
  }

  const roll = (student) => Number(student.rollNumber) || Number.MAX_SAFE_INTEGER;
  return {
    classGroup,
    exam: exam ?? '',
    exams,
    students: students
      .map(({ id, name, rollNumber }) => ({ id, name, rollNumber }))
      .sort((a, b) => roll(a) - roll(b) || a.name.localeCompare(b.name)),
    subjects,
    entries,
    isPublished,
    resultDate,
  };
}

/**
 * Saves the grid: a row per filled cell (created or updated in place), and
 * any cell that was cleared removes its row. All in one transaction, so the
 * class never ends up half-saved.
 *
 * @param {object} grid  the validated `marksGridSchema` payload
 * @param {(classGroup: string) => void} [assertClass]  teacher scope check
 */
export async function saveMarksGrid(grid, assertClass) {
  const classGroup = await resolveClassGroup(grid.classGroup);
  assertClass?.(classGroup);

  // Configured spelling for each subject; the grid's own spelling is kept as
  // the key the marks were sent under.
  const subjects = [];
  for (const subject of grid.subjects) {
    const name = await normaliseSubject(subject.name);
    if (subjects.some((s) => s.name === name)) throw ApiError.badRequest(`"${name}" is listed twice`);
    subjects.push({ name, sentAs: subject.name, maxMarks: subject.maxMarks });
  }

  const studentIds = grid.entries.map((entry) => entry.studentId);
  const students = await studentRepository.findWhere({ id: { in: studentIds }, classGroup });
  const byId = new Map(students.map((student) => [student.id, student]));
  if (studentIds.some((id) => !byId.has(id))) {
    throw ApiError.badRequest('One of the students is no longer in this class — reload the grid');
  }

  const existing = await resultRepository.findWhere({
    classGroup,
    exam: grid.exam,
    studentId: { in: studentIds },
    subject: { in: subjects.map((s) => s.name) },
  });
  const cellKey = (studentId, subject) => `${studentId}::${key(subject)}`;
  const current = new Map(existing.map((row) => [cellKey(row.studentId, row.subject), row]));

  const rows = [];
  const removeIds = [];
  for (const entry of grid.entries) {
    const student = byId.get(entry.studentId);
    for (const subject of subjects) {
      const typed = entry.marks[subject.sentAs] ?? entry.marks[subject.name];
      const marks = typed === undefined || typed === null ? null : Number(typed);
      const row = current.get(cellKey(student.id, subject.name));

      if (marks === null) {
        if (row) removeIds.push(row.id);
        continue;
      }
      if (marks > subject.maxMarks) {
        throw ApiError.badRequest(
          `${student.name}: ${subject.name} marks exceed the maximum of ${subject.maxMarks}`
        );
      }
      rows.push({
        id: row?.id,
        studentId: student.id,
        studentName: student.name,
        classGroup,
        exam: grid.exam,
        subject: subject.name,
        marks,
        maxMarks: subject.maxMarks,
        score: formatScore(marks, subject.maxMarks),
        resultDate: grid.resultDate ?? row?.resultDate ?? null,
        isPublished: grid.isPublished,
      });
    }
  }

  await resultRepository.saveGrid({ rows, removeIds });
  audit.record({
    action: grid.isPublished ? 'results.published' : 'results.grid_saved',
    category: 'results',
    entityType: 'ResultSheet',
    entityLabel: `${classGroup} · ${grid.exam}`,
    summary: `${grid.isPublished ? 'Published' : 'Saved draft'} marks sheet ${classGroup} · ${grid.exam}: ${grid.entries.length} students, ${subjects.map((s) => s.name).join(', ')} (${rows.length} marks${removeIds.length ? `, ${removeIds.length} cleared` : ''})`,
  });
  return { saved: rows.length, removed: removeIds.length, classGroup, exam: grid.exam };
}

/**
 * Rows → report cards: one entry per examination with its subject rows and
 * the total / percentage (over the subjects that have a maximum). Used by
 * the parent portal.
 */
export function groupResultsByExam(rows) {
  const exams = new Map();
  for (const row of rows) {
    const group = exams.get(row.exam) ?? {
      exam: row.exam,
      resultDate: row.resultDate,
      isPublished: row.isPublished,
      subjects: [],
      total: 0,
      totalMax: 0,
    };
    const marks = num(row.marks);
    const maxMarks = num(row.maxMarks);
    group.subjects.push({
      id: row.id,
      subject: row.subject ?? 'Overall',
      marks,
      maxMarks,
      score: row.score,
      remarks: row.remarks,
    });
    if (marks !== null && maxMarks !== null) {
      group.total += marks;
      group.totalMax += maxMarks;
    }
    if (row.resultDate && (!group.resultDate || row.resultDate > group.resultDate)) {
      group.resultDate = row.resultDate;
    }
    exams.set(row.exam, group);
  }

  return [...exams.values()].map((group) => ({
    ...group,
    percentage: group.totalMax > 0 ? Math.round((group.total / group.totalMax) * 1000) / 10 : null,
  }));
}
