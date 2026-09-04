/**
 * Content access used by server components.
 *
 * Each function tries the Express API first and silently falls back to the
 * bundled content in `@/data/fallback` when the API is absent or failing.
 * That means:
 *   · the site runs today, with no backend
 *   · a backend outage degrades to last-known-good content instead of a 500
 *
 * Cache tags let the admin panel call revalidateTag() after a save.
 */

import { apiFetch, API_ENABLED } from './api';
import * as fallback from '@/data/fallback';

async function withFallback(fetcher, fallbackValue) {
  if (!API_ENABLED) return fallbackValue;
  try {
    return await fetcher();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[serverApi] falling back to bundled content:', error.message);
    }
    return fallbackValue;
  }
}

/** Everything the homepage renders, in one round trip. */
export function getHomeData() {
  return withFallback(
    () => apiFetch('/home', { tags: ['home'], revalidate: 300 }),
    fallback.homePayload
  );
}

/** Site-wide settings used by the topbar, header and footer. */
export function getSettings() {
  return withFallback(
    () => apiFetch('/settings', { tags: ['settings'], revalidate: 3600 }),
    fallback.settings
  );
}

/** Active ticker lines. */
export function getAnnouncements() {
  return withFallback(
    () => apiFetch('/announcements', { tags: ['announcements'], revalidate: 300 }),
    fallback.announcements
  );
}

export function getAcademicStages() {
  return withFallback(
    () => apiFetch('/academic-stages', { tags: ['stages'] }),
    fallback.academicStages
  );
}

export function getStreams() {
  return withFallback(() => apiFetch('/streams', { tags: ['streams'] }), fallback.streams);
}

export function getFacilities() {
  return withFallback(() => apiFetch('/facilities', { tags: ['facilities'] }), fallback.facilities);
}

export function getPrincipal() {
  return withFallback(() => apiFetch('/faculty/principal', { tags: ['faculty'] }), fallback.principal);
}

export function getAchievements() {
  return withFallback(
    () => apiFetch('/achievements', { tags: ['achievements'] }),
    fallback.achievements
  );
}

/**
 * Paginated notice list.
 * @returns {Promise<{ items: object[], meta: { page, limit, total, totalPages } }>}
 */
export function getNotices({ page = 1, limit = 10, category } = {}) {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (category) query.set('category', category);

  const all = category ? fallback.notices.filter((n) => n.category === category) : fallback.notices;
  const start = (page - 1) * limit;

  return withFallback(
    async () => {
      const data = await apiFetch(`/notices?${query}`, { tags: ['notices'] });
      // API returns { items, meta } — normalise if it ever returns a bare array
      return Array.isArray(data)
        ? { items: data, meta: { page, limit, total: data.length, totalPages: 1 } }
        : data;
    },
    {
      items: all.slice(start, start + limit),
      meta: {
        page,
        limit,
        total: all.length,
        totalPages: Math.max(1, Math.ceil(all.length / limit)),
      },
    }
  );
}

export function getNoticeBySlug(slug) {
  return withFallback(
    () => apiFetch(`/notices/${slug}`, { tags: ['notices', `notice:${slug}`] }),
    fallback.notices.find((n) => n.slug === slug) ?? null
  );
}

export function getGalleryAlbums() {
  return withFallback(
    async () => {
      const data = await apiFetch('/gallery', { tags: ['gallery'] });
      return Array.isArray(data) ? data : (data?.items ?? []);
    },
    fallback.galleryAlbums
  );
}

export function getAlbumBySlug(slug) {
  return withFallback(
    () => apiFetch(`/gallery/${slug}`, { tags: ['gallery', `album:${slug}`] }),
    fallback.galleryAlbums.find((a) => a.slug === slug) ?? null
  );
}

export function getDownloads() {
  return withFallback(() => apiFetch('/downloads', { tags: ['downloads'] }), fallback.downloads);
}
