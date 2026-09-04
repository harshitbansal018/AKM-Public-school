import { prisma } from '../config/prisma.js';

const PUBLIC_SELECT = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  body: true,
  noticeDate: true,
  category: true,
  isPinned: true,
  updatedAt: true,
  download: { select: { id: true, title: true, filePath: true } },
};

/** Pinned notices first, then newest — matches how a real notice board reads. */
const PUBLIC_ORDER = [{ isPinned: 'desc' }, { noticeDate: 'desc' }, { id: 'desc' }];

function publicWhere({ category, search } = {}) {
  return {
    isPublished: true,
    ...(category ? { category } : {}),
    ...(search
      ? { OR: [{ title: { contains: search } }, { excerpt: { contains: search } }] }
      : {}),
  };
}

/** One query for the rows, one for the count — run together. */
export async function findPublished({ skip, take, category, search } = {}) {
  const where = publicWhere({ category, search });

  const [items, total] = await Promise.all([
    prisma.notice.findMany({ where, orderBy: PUBLIC_ORDER, skip, take, select: PUBLIC_SELECT }),
    prisma.notice.count({ where }),
  ]);

  return { items, total };
}

/** The short list shown on the homepage. */
export function findLatest(limit = 4) {
  return prisma.notice.findMany({
    where: { isPublished: true },
    orderBy: PUBLIC_ORDER,
    take: limit,
    select: PUBLIC_SELECT,
  });
}

export function findBySlug(slug) {
  return prisma.notice.findFirst({
    where: { slug, isPublished: true },
    select: PUBLIC_SELECT,
  });
}

export function slugExists(slug) {
  return prisma.notice.findUnique({ where: { slug }, select: { id: true } }).then(Boolean);
}

/** Fire-and-forget: a failed counter update must never break the page. */
export function incrementViews(id) {
  return prisma.notice
    .update({ where: { id: Number(id) }, data: { viewCount: { increment: 1 } } })
    .catch(() => null);
}

// ---------- admin ----------

export async function findAllPaged({ skip, take, category, search, isPublished } = {}) {
  const where = {
    ...(category ? { category } : {}),
    ...(typeof isPublished === 'boolean' ? { isPublished } : {}),
    ...(search ? { OR: [{ title: { contains: search } }, { excerpt: { contains: search } }] } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.notice.findMany({
      where,
      orderBy: [{ noticeDate: 'desc' }, { id: 'desc' }],
      skip,
      take,
      include: { author: { select: { id: true, name: true } } },
    }),
    prisma.notice.count({ where }),
  ]);

  return { items, total };
}

export function findById(id) {
  return prisma.notice.findUnique({ where: { id: Number(id) } });
}

export function create(data) {
  return prisma.notice.create({ data });
}

export function update(id, data) {
  return prisma.notice.update({ where: { id: Number(id) }, data });
}

export function remove(id) {
  return prisma.notice.delete({ where: { id: Number(id) } });
}

export function countPublished() {
  return prisma.notice.count({ where: { isPublished: true } });
}

/** Every published slug — used to build the sitemap. */
export function findAllSlugs() {
  return prisma.notice.findMany({
    where: { isPublished: true },
    select: { slug: true, updatedAt: true },
  });
}
