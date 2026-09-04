import { settings } from '@/data/fallback';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
export const SITE_NAME = settings.schoolName;

/**
 * Build a Next.js Metadata object with sensible school-site defaults.
 * @param {{ title?: string, description?: string, path?: string, image?: string }} options
 */
export function buildMetadata({ title, description, path = '/', image } = {}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Nursery to Class 12 | HPBOSE`;
  const desc =
    description ||
    'AKM Public Sr. Sec. School provides quality education from Nursery to Class 12 under HPBOSE in English & Hindi medium.';
  const url = `${SITE_URL}${path}`;

  return {
    title: fullTitle,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description: desc,
      url,
      siteName: SITE_NAME,
      locale: 'en_IN',
      type: 'website',
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: desc,
    },
  };
}

/** JSON-LD for the school itself — improves local search results. */
export function schoolJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'School',
    name: settings.schoolName,
    description:
      'Quality HPBOSE education from Nursery to Class 12 in English & Hindi medium.',
    url: SITE_URL,
    telephone: settings.phonePrimary,
    email: settings.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.addressShort,
      addressRegion: 'Himachal Pradesh',
      addressCountry: 'IN',
    },
    openingHours: 'Mo-Sa 08:00-14:00',
  };
}
