import { prisma } from '../config/prisma.js';

const ALBUM_ORDER = [{ sortOrder: 'asc' }, { eventDate: 'desc' }, { id: 'desc' }];
const IMAGE_ORDER = [{ sortOrder: 'asc' }, { id: 'asc' }];

// ---------- albums ----------

export function findPublishedAlbums() {
  return prisma.galleryAlbum.findMany({
    where: { isPublished: true },
    orderBy: ALBUM_ORDER,
    include: { _count: { select: { images: true } } },
  });
}

export function findAlbumBySlug(slug) {
  return prisma.galleryAlbum.findFirst({
    where: { slug, isPublished: true },
    include: { images: { orderBy: IMAGE_ORDER } },
  });
}

export function albumSlugExists(slug) {
  return prisma.galleryAlbum.findUnique({ where: { slug }, select: { id: true } }).then(Boolean);
}

export function findAllAlbums() {
  return prisma.galleryAlbum.findMany({
    orderBy: ALBUM_ORDER,
    include: { _count: { select: { images: true } } },
  });
}

export function findAlbumById(id) {
  return prisma.galleryAlbum.findUnique({
    where: { id: Number(id) },
    include: { images: { orderBy: IMAGE_ORDER } },
  });
}

export function createAlbum(data) {
  return prisma.galleryAlbum.create({ data });
}

export function updateAlbum(id, data) {
  return prisma.galleryAlbum.update({ where: { id: Number(id) }, data });
}

/** Images cascade-delete with the album (see onDelete: Cascade in the schema). */
export function removeAlbum(id) {
  return prisma.galleryAlbum.delete({ where: { id: Number(id) } });
}

export function countAlbums() {
  return prisma.galleryAlbum.count();
}

export function findAllAlbumSlugs() {
  return prisma.galleryAlbum.findMany({
    where: { isPublished: true },
    select: { slug: true, updatedAt: true },
  });
}

// ---------- images ----------

export function createImages(albumId, images) {
  return prisma.galleryImage.createMany({
    data: images.map((image, index) => ({
      albumId: Number(albumId),
      imagePath: image.imagePath,
      caption: image.caption ?? null,
      sortOrder: index,
    })),
  });
}

export function findImageById(id) {
  return prisma.galleryImage.findUnique({ where: { id: Number(id) } });
}

export function removeImage(id) {
  return prisma.galleryImage.delete({ where: { id: Number(id) } });
}

export function reorderImages(orderedIds) {
  return prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.galleryImage.update({ where: { id: Number(id) }, data: { sortOrder: index } })
    )
  );
}
