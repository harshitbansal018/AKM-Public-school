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
  if (!env.revalidate.url || !env.revalidate.secret) return;
  if (!tags?.length) return;

  try {
    const res = await fetch(env.revalidate.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-revalidate-secret': env.revalidate.secret,
      },
      body: JSON.stringify({ tags }),
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) {
      logger.warn(`Revalidation returned ${res.status} for [${tags.join(', ')}]`);
    } else {
      logger.debug(`Revalidated [${tags.join(', ')}]`);
    }
  } catch (error) {
    logger.warn(`Could not reach the frontend to revalidate: ${error.message}`);
  }
}

export default revalidate;
