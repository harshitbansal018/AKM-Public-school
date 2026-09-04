import { noticeRepository } from '../repositories/index.js';
import { serializeNotice, serializeNotices } from '../serializers/index.js';
import { toSkipTake, buildMeta } from '../utils/pagination.js';
import { uniqueSlug } from '../utils/slugify.js';
import { ApiError } from '../utils/ApiError.js';

// ---------- public ----------

export async function listPublished(query = {}) {
  const { page, limit, skip, take } = toSkipTake(query);
  const { items, total } = await noticeRepository.findPublished({
    skip,
    take,
    category: query.category,
    search: query.q,
  });

  return { items: serializeNotices(items), meta: buildMeta({ page, limit, total }) };
}

export async function getBySlug(slug) {
  const notice = await noticeRepository.findBySlug(slug);
  if (!notice) throw ApiError.notFound('That notice does not exist or is no longer published');

  noticeRepository.incrementViews(notice.id); // deliberately not awaited
  return serializeNotice(notice);
}

export async function latest(limit = 4) {
  return serializeNotices(await noticeRepository.findLatest(limit));
}

// ---------- admin ----------

export async function listAll(query = {}) {
  const { page, limit, skip, take } = toSkipTake(query);
  const { items, total } = await noticeRepository.findAllPaged({
    skip,
    take,
    category: query.category,
    search: query.q,
    isPublished: query.isPublished,
  });

  return { items, meta: buildMeta({ page, limit, total }) };
}

export async function getById(id) {
  const notice = await noticeRepository.findById(id);
  if (!notice) throw ApiError.notFound('Notice not found');
  return notice;
}

export async function create(input, authorId) {
  const slug = await uniqueSlug(input.title, noticeRepository.slugExists);

  return noticeRepository.create({
    ...input,
    slug,
    authorId: authorId ?? null,
    noticeDate: new Date(input.noticeDate),
  });
}

export async function update(id, input) {
  const existing = await getById(id);

  // Re-slug only when the title actually changed, so shared links keep working.
  const slug =
    input.title && input.title !== existing.title
      ? await uniqueSlug(input.title, noticeRepository.slugExists, existing.slug)
      : existing.slug;

  return noticeRepository.update(id, {
    ...input,
    slug,
    ...(input.noticeDate ? { noticeDate: new Date(input.noticeDate) } : {}),
  });
}

export async function setPublished(id, isPublished) {
  await getById(id);
  return noticeRepository.update(id, { isPublished });
}

export async function remove(id) {
  await getById(id);
  await noticeRepository.remove(id);
  return { deleted: true };
}
