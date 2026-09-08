import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import multer from 'multer';
import { env } from './env.js';
import { UPLOAD_FOLDERS } from './constants.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * JPG and PNG only.
 *
 * Deliberately narrow: these two cover every photo a phone or camera produces,
 * every browser renders them, and keeping the list short means fewer surprises
 * for whoever is uploading from the school office.
 */
const IMAGE_TYPES = ['image/jpeg', 'image/png'];
const IMAGE_LABEL = 'JPG or PNG';
const DOC_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

/** Creates uploads/<folder> on first use so a fresh clone works immediately. */
function ensureFolder(folder) {
  const safe = UPLOAD_FOLDERS.includes(folder) ? folder : 'misc';
  const dir = path.resolve(process.cwd(), env.uploadDir, safe);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/**
 * Filenames are generated, never taken from the client — an uploaded name like
 * "../../.env" would otherwise let someone write outside the uploads folder.
 */
function safeFilename(originalName) {
  const ext = path.extname(originalName).toLowerCase().slice(0, 10);
  const stem = path
    .basename(originalName, path.extname(originalName))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  const unique = crypto.randomBytes(6).toString('hex');
  return `${stem || 'file'}-${Date.now()}-${unique}${ext}`;
}

function buildStorage(folder) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, ensureFolder(folder)),
    filename: (_req, file, cb) => cb(null, safeFilename(file.originalname)),
  });
}

/**
 * @param {string[]} allowed  accepted mime types
 * @param {string} label      what to name them when rejecting, e.g. "JPG or PNG"
 */
function buildFilter(allowed, label) {
  return (_req, file, cb) => {
    if (allowed.includes(file.mimetype)) return cb(null, true);
    return cb(ApiError.badRequest(`Only ${label} files are allowed — you uploaded ${file.mimetype}`));
  };
}

export function imageUploader(folder = 'misc') {
  return multer({
    storage: buildStorage(folder),
    limits: { fileSize: env.maxImageBytes, files: 20 },
    fileFilter: buildFilter(IMAGE_TYPES, IMAGE_LABEL),
  });
}

export function documentUploader(folder = 'downloads') {
  return multer({
    storage: buildStorage(folder),
    limits: { fileSize: env.maxDocumentBytes, files: 1 },
    fileFilter: buildFilter([...DOC_TYPES, ...IMAGE_TYPES], 'PDF, Word, Excel, JPG or PNG'),
  });
}

export { IMAGE_TYPES, DOC_TYPES, IMAGE_LABEL };
