import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

/**
 * Tells the Next.js app to drop its cached copies after a content change.
 *
 * Which admin path was written maps to which cache tags to clear. The homepage
 * shows nearly everything, so almost every change also busts 'home'.
 */
const TAG_MAP = [
  [/^\/notices/, ['notices', 'home']],
  [/^\/announcements/, ['announcements', 'home']],
  [/^\/gallery/, ['gallery', 'home']],
  [/^\/settings/, ['settings', 'home']],
  [/^\/achievements/, ['achievements', 'home']],
  [/^\/faculty/, ['faculty', 'home']],
  [/^\/facilities/, ['facilities', 'home']],
  [/^\/streams/, ['streams', 'home']],
  [/^\/academic-stages/, ['stages', 'home']],
  [/^\/downloads/, ['downloads', 'home']],
];

export function tagsForPath(path = '') {
  const match = TAG_MAP.find(([pattern]) => pattern.test(path));
  return match ? match[1] : null;
}

/**
 * Fire-and-forget. A failed cache purge must never turn a successful save into
 * an error for the person who made it — the page just refreshes a bit later.
 */
export async function revalidate(tags) {
  const { urls, secret } = env.revalidate;
  if (!urls.length || !secret || !tags?.length) return;

  // Every configured target is pinged; in development most are dead ports and
  // that is fine — one of them is the running frontend.
  const results = await Promise.all(
    urls.map(async (url) => {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-revalidate-secret': secret,
          },
          body: JSON.stringify({ tags }),
          signal: AbortSignal.timeout(4000),
        });
        return res.ok;
      } catch {
        return false;
      }
    })
  );

  if (results.some(Boolean)) {
    logger.debug(`Revalidated [${tags.join(', ')}]`);
  } else {
    logger.warn(
      `Saved, but no frontend answered the cache refresh for [${tags.join(', ')}]. ` +
        `Tried: ${urls.join(', ')}. The website will catch up when its cache expires.`
    );
  }
}

export default revalidate;
