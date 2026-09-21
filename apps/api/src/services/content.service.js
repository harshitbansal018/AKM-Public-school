/**
 * The "simple content" resources: facilities, streams, academic stages,
 * faculty and achievements.
 *
 * They share one behaviour — a sorted, publishable list — so they share one
 * service built by a factory. Each resource still gets its own named export
 * and its own controller/route, so the API surface stays explicit.
 */
import {
  facilityRepository,
  streamRepository,
  academicStageRepository,
  facultyRepository,
  achievementRepository,
} from '../repositories/index.js';
import {
  serializeFaculty,
  serializeFacultyAdmin,
  serializeAchievement,
  serializeFacility,
} from '../serializers/index.js';
import { ApiError } from '../utils/ApiError.js';
import { hashPassword } from '../utils/password.js';
import { resolveClassGroups } from './setting.service.js';
import { sendWelcome } from './auth.service.js';
import { TOKEN_KIND } from '../utils/jwt.js';

function createContentService(repository, label, serialize = (row) => row) {
  return {
    async listPublic() {
      return (await repository.findPublished()).map(serialize);
    },

    async listAll() {
      return (await repository.findAll()).map(serialize);
    },

    async getById(id) {
      const row = await repository.findById(id);
      if (!row) throw ApiError.notFound(`${label} not found`);
      return serialize(row);
    },

    async create(data) {
      return serialize(await repository.create(data));
    },

    async update(id, data) {
      const row = await repository.findById(id);
      if (!row) throw ApiError.notFound(`${label} not found`);
      return serialize(await repository.update(id, data));
    },

    async remove(id) {
      const row = await repository.findById(id);
      if (!row) throw ApiError.notFound(`${label} not found`);
      await repository.remove(id);
      return { deleted: true };
    },

    async reorder(ids) {
      await repository.reorder(ids);
      return { reordered: ids.length };
    },
  };
}

export const facilityService = createContentService(
  facilityRepository,
  'Facility',
  serializeFacility
);

export const streamService = createContentService(streamRepository, 'Stream');

export const academicStageService = createContentService(academicStageRepository, 'Stage');

/**
 * Faculty doubles as the teacher-portal account, so the admin view carries the
 * sign-in fields while the public list never does.
 */
/** Emails the teacher their portal details the first time access is switched on. */
async function welcomeTeacher(row, hadAccess, password) {
  if (row.teacherAccess && !hadAccess) sendWelcome(TOKEN_KIND.FACULTY, row, password);
}

export const facultyService = {
  ...createContentService(facultyRepository, 'Faculty member', serializeFacultyAdmin),

  async listPublic() {
    return (await facultyRepository.findPublished()).map(serializeFaculty);
  },

  async create(input) {
    const data = await facultyAccessData(input, null);
    const created = await facultyRepository.create(data);
    await welcomeTeacher(created, false, input.password);
    return serializeFacultyAdmin(created);
  },

  async update(id, input) {
    const row = await facultyRepository.findById(id);
    if (!row) throw ApiError.notFound('Faculty member not found');
    const data = await facultyAccessData(input, row);
    const updated = await facultyRepository.update(id, data);
    await welcomeTeacher(updated, row.teacherAccess, input.password);
    return serializeFacultyAdmin(updated);
  },

  /** The principal's block on the homepage and about page. */
  async getPrincipal() {
    const staff = await facultyRepository.findPublished();
    const principal = staff.find((person) => person.isPrincipal) ?? staff[0] ?? null;
    return principal ? serializeFaculty(principal) : null;
  },

  /** Public leadership messages. A person marked as both remains the Principal. */
  async getLeadership() {
    const staff = await facultyRepository.findPublished();
    const principal = staff.find((person) => person.isPrincipal) ?? staff[0] ?? null;
    const director = staff.find((person) => person.isDirector && !person.isPrincipal) ?? null;

    return {
      principal: serializeFaculty(principal),
      director: serializeFaculty(director),
    };
  },
};

/**
 * Turns the validated form payload into a Faculty row: hashes a new password,
 * stores the class list as JSON, and refuses to switch on portal access for a
 * member who could not actually sign in (no email or no password yet).
 */
async function facultyAccessData({ password, ...data }, existing) {
  const next = { ...data };
  if (Array.isArray(next.assignedClasses)) {
    next.assignedClasses = JSON.stringify(await resolveClassGroups(next.assignedClasses));
  }
  if (password) next.passwordHash = await hashPassword(password);

  const teacherAccess = next.teacherAccess ?? existing?.teacherAccess ?? false;
  if (teacherAccess) {
    const email = 'accountEmail' in next ? next.accountEmail : existing?.accountEmail;
    if (!email) throw ApiError.badRequest('Enter a login email to allow teacher portal access');
    if (!next.passwordHash && !existing?.passwordHash) {
      throw ApiError.badRequest('Set a login password to allow teacher portal access');
    }
  }
  return next;
}

export const achievementService = {
  ...createContentService(achievementRepository, 'Achievement', serializeAchievement),

  async listPublicFiltered({ year, type } = {}) {
    const rows = await achievementRepository.findPublished();
    return rows
      .filter((row) => (year ? row.year === Number(year) : true))
      .filter((row) => (type ? row.type === type : true))
      .map(serializeAchievement);
  },
};
