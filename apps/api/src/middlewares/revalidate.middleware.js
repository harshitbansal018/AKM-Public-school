import { revalidate, tagsForPath } from '../services/revalidate.service.js';

/**
 * Busts the frontend cache after any successful admin write.
 *
 * Hooked to the response's 'finish' event rather than called from each service,
 * so it covers every current and future admin mutation without twenty separate
 * call sites that someone will eventually forget to add.
 */
export function revalidateOnWrite(req, res, next) {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }

  res.on('finish', () => {
    if (res.statusCode >= 400) return;

    const tags = tagsForPath(req.path);
    if (tags) revalidate(tags); // deliberately not awaited
  });

  return next();
}

export default revalidateOnWrite;
