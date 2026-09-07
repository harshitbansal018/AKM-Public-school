import { ApiError } from './ApiError.js';

/**
 * Normalises whatever someone pastes from Google Maps into an embeddable URL.
 *
 * Google offers two very different things and they are easy to confuse:
 *
 *   Share      https://maps.app.goo.gl/abc  or  .../maps/place/...
 *              Cannot be framed — Google sends X-Frame-Options and the map
 *              renders as a blank box with no error anywhere.
 *
 *   Embed      <iframe src="https://www.google.com/maps/embed?pb=..."></iframe>
 *              This is the one that works, but it arrives as HTML, not a URL.
 *
 * So: pull the src out of a pasted iframe, accept a bare embed URL, and reject
 * a share link with an explanation instead of silently rendering nothing.
 */
export function normaliseMapEmbed(input) {
  const raw = String(input ?? '').trim();
  if (!raw) return '';

  // Pasted the whole <iframe ...> block — take its src.
  const fromIframe = raw.match(/src\s*=\s*["']([^"']+)["']/i);
  const url = (fromIframe ? fromIframe[1] : raw).trim();

  if (!/^https:\/\//i.test(url)) {
    throw ApiError.badRequest(
      'The map link must start with https:// — paste the embed code from Google Maps.'
    );
  }

  if (/^https:\/\/(www\.)?google\.[a-z.]+\/maps\/embed/i.test(url)) {
    return url;
  }

  // Anything else that is still a Google Maps link is almost certainly a share
  // link, which will not display. Say so rather than accepting a broken value.
  if (/google\.[a-z.]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps/i.test(url)) {
    throw ApiError.badRequest(
      'That is a Google Maps share link, which cannot be embedded. On Google Maps choose ' +
        'Share → Embed a map → Copy HTML, and paste that here instead.'
    );
  }

  throw ApiError.badRequest('That does not look like a Google Maps embed link.');
}

export default normaliseMapEmbed;
