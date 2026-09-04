import fs from 'node:fs/promises';
import path from 'node:path';
import { galleryRepository } from '../repositories/index.js';
import { serializeAlbum, serializeAlbums } from '../serializers/index.js';
import { uniqueSlug } from '../utils/slugify.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

// ---------- public ----------

export async function listPublic() {
  return serializeAlbums(await galleryRepository.findPublishedAlbums());
}

export async function getBySlug(slug) {
  const album = await galleryRepository.findAlbumBySlug(slug);
  if (!album) throw ApiError.notFound('That album does not exist or is not published');
  return serializeAlbum(album);
}

// ---------- admin: albums ----------

export async function listAll() {
  return serializeAlbums(await galleryRepository.findAllAlbums());
}

export async function getById(id) {
  const album = await galleryRepository.findAlbumById(id);
  if (!album) throw ApiError.notFound('Album not found');
  return serializeAlbum(album);
}

export async function createAlbum(input) {
  const slug = await uniqueSlug(input.title, galleryRepository.albumSlugExists);

  return serializeAlbum(
    await galleryRepository.createAlbum({
      ...input,
      slug,
      ...(input.eventDate ? { eventDate: new Date(input.eventDate) } : {}),
    })
  );
}

export async function updateAlbum(id, input) {
  const existing = await galleryRepository.findAlbumById(id);
  if (!existing) throw ApiError.notFound('Album not found');

  const slug =
    input.title && input.title !== existing.title
      ? await uniqueSlug(input.title, galleryRepository.albumSlugExists, existing.slug)
      : existing.slug;

  return serializeAlbum(
    await galleryRepository.updateAlbum(id, {
      ...input,
      slug,
      ...(input.eventDate !== undefined
        ? { eventDate: input.eventDate ? new Date(input.eventDate) : null }
        : {}),
    })
  );
}

/** Deletes the album row (images cascade) and then the files it owned. */
export async function removeAlbum(id) {
  const album = await galleryRepository.findAlbumById(id);
  if (!album) throw ApiError.notFound('Album not found');

  await galleryRepository.removeAlbum(id);
  await Promise.all(album.images.map((image) => deleteFile(image.imagePath)));

  return { deleted: true, imagesRemoved: album.images.length };
}

// ---------- admin: images ----------

export async function addImages(albumId, files, captions = []) {
  const album = await galleryRepository.findAlbumById(albumId);
  if (!album) throw ApiError.notFound('Album not found');
  if (!files?.length) throw ApiError.badRequest('No images were uploaded');

  await galleryRepository.createImages(
    albumId,
    files.map((file, index) => ({
      imagePath: `gallery/${file.filename}`,
      caption: captions[index] ?? null,
    }))
  );

  // First upload into an empty album becomes its cover.
  if (!album.coverImage) {
    await galleryRepository.updateAlbum(albumId, { coverImage: `gallery/${files[0].filename}` });
  }

  return getById(albumId);
}

export async function removeImage(imageId) {
  const image = await galleryRepository.findImageById(imageId);
  if (!image) throw ApiError.notFound('Image not found');

  await galleryRepository.removeImage(imageId);
  await deleteFile(image.imagePath);

  return { deleted: true };
}

export async function reorderImages(ids) {
  await galleryRepository.reorderImages(ids);
  return { reordered: ids.length };
}

/**
 * Removes an upload from disk. Never throws — the database is the source of
 * truth, and a leftover file is a smaller problem than a failed delete.
 */
async function deleteFile(relativePath) {
  if (!relativePath) return;
  try {
    await fs.unlink(path.resolve(process.cwd(), env.uploadDir, relativePath));
  } catch (error) {
    if (error.code !== 'ENOENT') logger.warn(`Could not delete ${relativePath}: ${error.message}`);
  }
}
