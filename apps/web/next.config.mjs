/**
 * Uploaded images are served by Express at /uploads, and the API hands the
 * frontend an absolute URL for them (PUBLIC_BASE_URL + /uploads/...).
 *
 * next/image refuses any host that is not allow-listed here, so the site's own
 * domain has to be on the list. Reading it from NEXT_PUBLIC_SITE_URL means a
 * deployment only sets an environment variable — forgetting to edit this file
 * would otherwise break every uploaded image in production with a bare 400.
 */
function siteHostPattern() {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  if (!url) return [];

  try {
    const { protocol, hostname, port } = new URL(url);
    return [
      {
        protocol: protocol.replace(':', ''),
        hostname,
        ...(port ? { port } : {}),
      },
    ];
  } catch {
    // A malformed URL should not take the whole build down.
    return [];
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Hides the floating Next.js dev badge in the corner during `next dev`.
  // It never appears in a production build, so this is purely cosmetic.
  devIndicators: false,

  images: {
    remotePatterns: [
      ...siteHostPattern(),
      // Local development, whichever port the app happens to be on.
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '127.0.0.1' },
    ],
  },
};

export default nextConfig;
