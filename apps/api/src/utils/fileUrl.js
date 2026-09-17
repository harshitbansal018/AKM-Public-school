import fs from 'node:fs';
import path from 'node:path';
import { env } from '../config/env.js';
import { ApiError } from './ApiError.js';

/**
 * Turns a stored relative path into a URL the browser can load.
 *   'gallery/sports-01.jpg' -> 'http://localhost:5000/uploads/gallery/sports-01.jpg'
 *
 * Absolute URLs pass through untouched, so moving uploads to S3 or Cloudinary
 * later needs no change here.
 */
export function toFileUrl(storedPath) {
  if (!storedPath) return null;
  if (/^https?:\/\//i.test(storedPath)) return storedPath;
  const clean = String(storedPath).replace(/^\/+/, '');
  return `${env.publicBaseUrl}/${env.uploadDir}/${clean}`;
}

/**
 * The absolute path of a stored upload, refusing anything that resolves
 * outside the uploads directory (a stored "../../.env" must never be served).
 */
export function resolveUploadPath(storedPath) {
  const root = path.resolve(process.cwd(), env.uploadDir);
  const absolute = path.resolve(root, String(storedPath));
  if (!absolute.startsWith(root + path.sep)) throw ApiError.notFound('File not found');
  return absolute;
}

/**
 * Streams a stored upload as an attachment under the given filename. Used for
 * files that are deliberately not on the static /uploads mount, such as CVs.
 */
export async function sendUploadedFile(res, storedPath, filename) {
  const absolute = resolveUploadPath(storedPath);
  let stats;
  try {
    stats = await fs.promises.stat(absolute);
  } catch {
    throw ApiError.notFound('That file is missing from the server');
  }

  const safeName = filename.replace(/["\r\n]/g, '');
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Length', stats.size);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(safeName)}`
  );
  await new Promise((resolve, reject) => {
    fs.createReadStream(absolute).on('error', reject).on('end', resolve).pipe(res);
  });
}

export default toFileUrl;
