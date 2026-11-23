import { NextResponse } from 'next/server';

/**
 * Next.js can only discover a missing dynamic item after React streaming has
 * started, at which point the HTTP status is already 200. Check the same-origin
 * API before rendering detail pages and rewrite genuine API 404s to a public
 * error page with the correct status.
 */
export async function middleware(request) {
  const [, resource, slug] = request.nextUrl.pathname.split('/');
  if (!slug || (resource !== 'notices' && resource !== 'gallery')) {
    return NextResponse.next();
  }

  try {
    const apiBase = (
      process.env.INTERNAL_API_URL ||
      `http://127.0.0.1:${process.env.PORT || 3000}/api/v1`
    ).replace(/\/$/, '');
    const apiUrl = `${apiBase}/${resource}/${encodeURIComponent(slug)}`;
    const result = await fetch(apiUrl, { method: 'HEAD', cache: 'no-store' });

    if (result.status === 404 && result.headers.get('x-akm-resource-check') === '1') {
      const response = NextResponse.rewrite(new URL('/resource-not-found', request.url), {
        status: 404,
      });
      response.headers.set('X-Robots-Tag', 'noindex, nofollow');
      return response;
    }
  } catch {
    // The page's server component has bundled fallback content for temporary
    // API outages, so a preflight network failure must not take the site down.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/notices/:slug', '/gallery/:slug'],
};
