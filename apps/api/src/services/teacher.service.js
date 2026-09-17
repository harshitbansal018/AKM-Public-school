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
import { facultyClasses, serializeTeacher } from '../serializers/index.js';
import { withResolvedClass, withStudent } from './internalRecords.service.js';
import { ApiError } from '../utils/ApiError.js';

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
function createScopedService(repository, label, prepare) {
  return {
    async list(teacher) {
      return repository.findWhere(inClasses(teacher));
    },

    async getById(teacher, id) {
      const row = await repository.findById(id);
      if (!row) throw ApiError.notFound(`${label} not found`);
      if (!facultyClasses(teacher).includes(row.classGroup)) {
        throw ApiError.forbidden('This record is outside your assigned classes');
      }
      return row;
    },

    async create(teacher, input) {
      const data = await prepare(input);
      assertOwnClass(teacher, data.classGroup);
      return repository.create(data);
    },

    async update(teacher, id, input) {
      const row = await this.getById(teacher, id);
      const data = await prepare(input);
      assertOwnClass(teacher, data.classGroup ?? row.classGroup);
      return repository.update(id, data);
    },

    async remove(teacher, id) {
      await this.getById(teacher, id);
      await repository.remove(id);
      return { deleted: true };
    },
  };
}

/** Homework a teacher saves is live at once — there is no draft step in the portal. */
const publishedHomework = async (data) => ({ ...(await withResolvedClass(data)), isPublished: true });

export const teacherHomeworkService = createScopedService(homeworkRepository, 'Homework', publishedHomework);
export const teacherResultService = createScopedService(resultRepository, 'Result', withStudent);

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
