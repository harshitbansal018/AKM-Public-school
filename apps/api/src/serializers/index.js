/**
 * Serializers decide what the client is allowed to see — the "V" of MVC for a
 * JSON API. Two jobs:
 *   1. strip secrets (a password hash must never leave this process)
 *   2. shape rows the way the frontend already expects
 *
 * Keeping this in one layer means a new field added to the schema is invisible
 * to the public API until someone deliberately exposes it here.
 */
import { toFileUrl } from '../utils/fileUrl.js';

export function serializeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

export function serializeUsers(users = []) {
  return users.map(serializeUser);
}

export function serializeNotice(notice) {
  if (!notice) return null;
  return {
    ...notice,
    download: notice.download
      ? { ...notice.download, filePath: toFileUrl(notice.download.filePath) }
      : null,
  };
}

export function serializeNotices(notices = []) {
  return notices.map(serializeNotice);
}

export function serializeAlbum(album) {
  if (!album) return null;
  return {
    ...album,
    coverImage: toFileUrl(album.coverImage),
    imageCount: album._count?.images ?? album.images?.length ?? 0,
    images: (album.images ?? []).map((image) => ({
      ...image,
      imagePath: toFileUrl(image.imagePath),
    })),
    _count: undefined,
  };
}

export function serializeAlbums(albums = []) {
  return albums.map(serializeAlbum);
}

export function serializeFaculty(person) {
  if (!person) return null;
  return { ...person, photo: toFileUrl(person.photo) };
}

export function serializeAchievement(item) {
  if (!item) return null;
  return { ...item, photo: toFileUrl(item.photo) };
}

export function serializeFacility(item) {
  if (!item) return null;
  return { ...item, image: toFileUrl(item.image) };
}

export function serializeDownload(item) {
  if (!item) return null;
  // filePath stays relative on purpose — downloads go through the counted
  // /downloads/:id/file route rather than being fetched directly.
  return {
    id: item.id,
    title: item.title,
    category: item.category,
    fileSize: item.fileSize,
    mimeType: item.mimeType,
    downloadCount: item.downloadCount,
    createdAt: item.createdAt,
    hasFile: Boolean(item.filePath),
  };
}

export function serializeDownloads(items = []) {
  return items.map(serializeDownload);
}

/** Setting rows -> one flat object the frontend can spread straight in. */
export function serializeSettings(rows = []) {
  return rows.reduce((out, row) => {
    out[row.key] = row.value;
    return out;
  }, {});
}

/** Admin view keeps group/label so the settings screen can render sections. */
export function serializeSettingRows(rows = []) {
  return rows;
}
