import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * Who is making the current request, available anywhere down the call chain
 * without threading `req` through every service — the audit log reads it.
 */
const storage = new AsyncLocalStorage();

/** Express middleware: runs the rest of the request inside a context. */
export function requestContext(req, _res, next) {
  storage.run({ req }, next);
}

/** The current request, or undefined outside one (seed scripts, cron jobs). */
export function currentRequest() {
  return storage.getStore()?.req;
}

export default requestContext;
