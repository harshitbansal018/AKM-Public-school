/**
 * Everything a signed-in teacher may read or write, scoped to the classes the
 * admin assigned on their Faculty record. The scope is enforced here — on the
 * server — not just hidden in the portal's UI.
 */
import {
  studentRepository,
  homeworkRepository,
  resultRepository,
} from '../repositories/index.js';
import { facultyClasses, serializeTeacher, serializeHomework } from '../serializers/index.js';
import { withResolvedClass } from './internalRecords.service.js';
import { prepareResult, loadMarksGrid, saveMarksGrid } from './result.service.js';
import { resolveClassGroup } from './setting.service.js';
import { ApiError } from '../utils/ApiError.js';
import * as audit from './audit.service.js';

const inClasses = (teacher) => ({ classGroup: { in: facultyClasses(teacher) } });

function assertOwnClass(teacher, classGroup) {
  if (!facultyClasses(teacher).includes(classGroup)) {
    throw ApiError.forbidden('Choose one of your assigned classes');
  }
}

/**
 * Homework and results share one shape: class-scoped CRUD. `prepare` fills in
 * the class (from the configured list, or from the chosen student) before the
 * scope check, so a teacher can only ever write into their own classes.
 */
function createScopedService(repository, label, prepare, serialize = (row) => row, log) {
  const action = (verb, row, changes) =>
    log &&
    audit.record({
      action: `${log.category}.${verb}`,
      category: log.category,
      label,
      entityType: log.type,
      entityId: row.id,
      entityLabel: log.label(row),
      related: log.related?.(row) ?? null,
      changes,
    });

  return {
    async list(teacher) {
      return (await repository.findWhere(inClasses(teacher))).map(serialize);
    },

    async getById(teacher, id) {
      const row = await repository.findById(id);
      if (!row) throw ApiError.notFound(`${label} not found`);
      if (!facultyClasses(teacher).includes(row.classGroup)) {
        throw ApiError.forbidden('This record is outside your assigned classes');
      }
      return serialize(row);
    },

    async create(teacher, input) {
      const data = await prepare(input);
      assertOwnClass(teacher, data.classGroup);
      const row = await repository.create(data);
      action('created', row);
      return serialize(row);
    },

    async update(teacher, id, input) {
      const row = await this.getById(teacher, id);
      const data = await prepare(input, row);
      assertOwnClass(teacher, data.classGroup ?? row.classGroup);
      const updated = await repository.update(id, data);
      action('updated', updated, audit.diff(row, updated));
      return serialize(updated);
    },

    async remove(teacher, id) {
      const row = await this.getById(teacher, id);
      await repository.remove(id);
      action('deleted', row);
      return { deleted: true };
    },
  };
}

/** Homework a teacher saves is live at once — there is no draft step in the portal. */
const publishedHomework = async (data) => ({ ...(await withResolvedClass(data)), isPublished: true });

export const teacherHomeworkService = createScopedService(homeworkRepository, 'Homework', publishedHomework, serializeHomework, {
  category: 'homework',
  type: 'Homework',
  label: (row) => `${row.title} · ${row.classGroup}`,
});
export const teacherResultService = createScopedService(resultRepository, 'Result', prepareResult, (row) => row, {
  category: 'results',
  type: 'Result',
  label: (row) => `${row.studentName} · ${row.classGroup} · ${row.exam}${row.subject ? ` · ${row.subject}` : ''}`,
  related: (row) => (row.studentId ? { type: 'Student', id: row.studentId } : null),
});

/** The marks grid, limited to the teacher's own classes. */
export async function loadTeacherMarksGrid(teacher, query) {
  assertOwnClass(teacher, await resolveClassGroup(query.classGroup));
  return loadMarksGrid(query);
}

export function saveTeacherMarksGrid(teacher, grid) {
  return saveMarksGrid(grid, (classGroup) => assertOwnClass(teacher, classGroup));
}

export function listStudents(teacher) {
  return studentRepository.findWhere(inClasses(teacher));
}

export async function getDashboard(teacher) {
  const where = inClasses(teacher);
  const [studentsCount, homeworkCount, resultCount, recentHomework, recentResults] =
    await Promise.all([
      studentRepository.count(where),
      homeworkRepository.count(where),
      resultRepository.count(where),
      homeworkRepository.findWhere(where, { take: 5 }),
      resultRepository.findWhere(where, { take: 5 }),
    ]);

  return {
    teacher: serializeTeacher(teacher),
    classes: facultyClasses(teacher),
    studentsCount,
    homeworkCount,
    resultCount,
    recentHomework,
    recentResults,
  };
}
