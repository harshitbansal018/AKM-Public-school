import fs from 'node:fs/promises';
import path from 'node:path';
import { downloadRepository } from '../repositories/index.js';
import { serializeDownload, serializeDownloads } from '../serializers/index.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export async function listPublic(category) {
  return serializeDownloads(await downloadRepository.findPublic(category));
}

export async function listAll() {
  return downloadRepository.findAll();
}

export async function getById(id) {
  const row = await downloadRepository.findById(id);
  if (!row) throw ApiError.notFound('Download not found');
  return row;
}

/**
 * Resolves the file for the counted download route.
 * The resolved path is checked to be inside the uploads folder — a stored path
 * containing "../" must not be able to serve arbitrary files off the disk.
 */
export async function resolveFile(id) {
  const row = await downloadRepository.findById(id);
  if (!row || !row.isPublic) throw ApiError.notFound('Download not found');
  if (!row.filePath) throw ApiError.notFound('No file has been attached to this item yet');

  const uploadsRoot = path.resolve(process.cwd(), env.uploadDir);
  const absolute = path.resolve(uploadsRoot, row.filePath);

  if (!absolute.startsWith(uploadsRoot + path.sep)) {
    logger.error(`Blocked path traversal attempt for download ${id}: ${row.filePath}`);
    throw ApiError.notFound('Download not found');
  }

  try {
    await fs.access(absolute);
  } catch {
    throw ApiError.notFound('That file is missing from the server');
  }

  downloadRepository.incrementCount(id); // not awaited

  return { absolutePath: absolute, filename: path.basename(row.filePath), title: row.title };
}

export function create(data) {
  return downloadRepository.create(data);
}

export async function update(id, data) {
  await getById(id);
  return downloadRepository.update(id, data);
}

export async function remove(id) {
  const row = await getById(id);
  await downloadRepository.remove(id);

  if (row.filePath) {
    try {
      await fs.unlink(path.resolve(process.cwd(), env.uploadDir, row.filePath));
    } catch (error) {
      if (error.code !== 'ENOENT') logger.warn(`Could not delete file: ${error.message}`);
    }
  }

  return { deleted: true };
}

export { serializeDownload };
