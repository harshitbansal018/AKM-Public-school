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
  serializeAchievement,
  serializeFacility,
} from '../serializers/index.js';
import { ApiError } from '../utils/ApiError.js';

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

export const facultyService = {
  ...createContentService(facultyRepository, 'Faculty member', serializeFaculty),

  /** The principal's block on the homepage and about page. */
  async getPrincipal() {
    const staff = await facultyRepository.findPublished();
    const principal = staff.find((person) => person.isPrincipal) ?? staff[0] ?? null;
    return principal ? serializeFaculty(principal) : null;
  },
};

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
