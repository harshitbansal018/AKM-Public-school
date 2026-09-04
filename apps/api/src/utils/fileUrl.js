import { env } from '../config/env.js';

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

export default toFileUrl;
