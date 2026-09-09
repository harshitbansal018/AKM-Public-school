import { getNotices, getGalleryAlbums } from '@/lib/serverApi';
import { SITE_URL } from '@/lib/seo';

const STATIC_ROUTES = [
  { path: '/', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/about', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/academics', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/admissions', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/faculty', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/facilities', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/achievements', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/notices', priority: 0.9, changeFrequency: 'daily' },
  { path: '/gallery', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/downloads', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/contact', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/privacy-policy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/disclaimer', priority: 0.3, changeFrequency: 'yearly' },
];

/** Generated at build time and revalidated with the notice cache. */
export default async function sitemap() {
  const [{ items: notices }, albums] = await Promise.all([
    getNotices({ page: 1, limit: 200 }),
    getGalleryAlbums(),
  ]);

  const now = new Date();

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: `${SITE_URL}${route.path}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...notices.map((notice) => ({
      url: `${SITE_URL}/notices/${notice.slug}`,
      lastModified: new Date(notice.updatedAt || notice.noticeDate),
      changeFrequency: 'monthly',
      priority: 0.6,
    })),
    ...albums.map((album) => ({
      url: `${SITE_URL}/gallery/${album.slug}`,
      lastModified: new Date(album.updatedAt || now),
      changeFrequency: 'monthly',
      priority: 0.5,
    })),
  ];
}
