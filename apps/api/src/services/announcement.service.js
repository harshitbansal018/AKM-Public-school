import { announcementRepository } from '../repositories/index.js';
import { ApiError } from '../utils/ApiError.js';

export function listActive() {
  return announcementRepository.findActive();
}

export function listAll() {
  return announcementRepository.findAll();
}

async function mustExist(id) {
  const row = await announcementRepository.findById(id);
  if (!row) throw ApiError.notFound('Announcement not found');
  return row;
}

export function create(data) {
  return announcementRepository.create(normaliseDates(data));
}

export async function update(id, data) {
  await mustExist(id);
  return announcementRepository.update(id, normaliseDates(data));
}

export async function remove(id) {
  await mustExist(id);
  await announcementRepository.remove(id);
  return { deleted: true };
}

export async function reorder(ids) {
  await announcementRepository.reorder(ids);
  return { reordered: ids.length };
}

/** Turns optional ISO date strings into Date objects, leaving nulls alone. */
function normaliseDates(data) {
  return {
    ...data,
    ...(data.startsAt !== undefined
      ? { startsAt: data.startsAt ? new Date(data.startsAt) : null }
      : {}),
    ...(data.endsAt !== undefined ? { endsAt: data.endsAt ? new Date(data.endsAt) : null } : {}),
  };
}
