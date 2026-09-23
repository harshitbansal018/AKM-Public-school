/**
 * The audit log: who did what, to which record, and what changed.
 *
 * Services call `record()` at the point the change is saved. It reads the
 * signed-in account and the IP from the request context, so callers pass only
 * what they know — the action, the record and the before/after rows. Writes
 * are fire-and-forget: a slow or failed log line must never fail the save.
 */
import { auditLogRepository } from '../repositories/index.js';
import { currentRequest } from '../utils/requestContext.js';
import { toSkipTake, buildMeta } from '../utils/pagination.js';
import { logger } from '../utils/logger.js';

/** Fields that never go into the log, whatever changes. */
const SECRET_FIELDS = new Set(['passwordHash', 'password', 'tokenHash', 'resumePath']);
/** Bookkeeping fields that change on every save and say nothing. */
const NOISE_FIELDS = new Set(['updatedAt', 'createdAt', 'id', 'lastLoginAt', 'viewCount', 'downloadCount']);

export const CATEGORIES = {
  fees: 'Fees',
  results: 'Results',
  salary: 'Faculty salary',
  students: 'Students',
  parents: 'Parents',
  faculty: 'Faculty',
  homework: 'Homework',
  users: 'Users & permissions',
  auth: 'Sign-ins',
  applications: 'Job applications',
  policies: 'Policies',
  content: 'Website content',
  settings: 'Settings',
};

/** "Aarav Verma" instead of {"name":"Aarav Verma",...} in the change list. */
const plain = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'object') {
    if (typeof value.toNumber === 'function') return String(value.toNumber());
    return JSON.stringify(value);
  }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
};

/**
 * The fields that differ between two rows, as { field: { from, to } }.
 * Only fields present in `after` are compared, so a partial update reports
 * just what the form sent.
 */
export function diff(before = {}, after = {}) {
  const changes = {};
  for (const key of Object.keys(after ?? {})) {
    if (SECRET_FIELDS.has(key) || NOISE_FIELDS.has(key)) continue;
    if (typeof after[key] === 'object' && after[key] !== null && !(after[key] instanceof Date) && !after[key].toNumber) {
      // Relations / JSON: compare as text.
      if (JSON.stringify(before?.[key] ?? null) === JSON.stringify(after[key])) continue;
    }
    const from = plain(before?.[key]);
    const to = plain(after[key]);
    if (from === to) continue;
    changes[key] = { from, to };
  }
  // A password change is worth knowing about, without the value.
  if (after?.passwordHash && before?.passwordHash !== after.passwordHash) changes.password = { from: '•••', to: 'changed' };
  return changes;
}

/** camelCase field name -> words, for the summary line. */
const words = (key) => key.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();

const VERBS = { created: 'Added', updated: 'Updated', deleted: 'Deleted' };

/**
 * Writes one log line. Never throws.
 *
 * @param {object} entry
 * @param {string} entry.action     e.g. 'fee.updated', 'salary.paid', 'auth.login_failed'
 * @param {string} entry.category   a key of CATEGORIES
 * @param {string} [entry.entityType]  'FeeRecord', 'Student', …
 * @param {number} [entry.entityId]
 * @param {string} [entry.entityLabel] 'Aarav Verma · Class 5'
 * @param {string} [entry.summary]  plain-English line; built from the rest when omitted
 * @param {object} [entry.changes]  { field: { from, to } } — from diff()
 * @param {{type: string, id: number}} [entry.related]  the person this is about (a fee's student)
 * @param {{kind: string, id?: number, name?: string, role?: string}} [entry.actor]  overrides the request's user
 */
export function record(entry) {
  Promise.resolve()
    .then(() => auditLogRepository.create(shape(entry)))
    .catch((error) => logger.error('Audit log write failed:', error.message));
}

function shape(entry) {
  const req = currentRequest();
  const user = entry.actor ?? actorFromRequest(req);
  const changes = entry.changes && Object.keys(entry.changes).length ? entry.changes : null;

  return {
    actorKind: user?.kind ?? 'system',
    actorId: user?.id ?? null,
    actorName: user?.name ?? (user?.kind === 'system' ? 'System' : null),
    actorRole: user?.role ?? null,
    action: entry.action,
    category: entry.category,
    entityType: entry.entityType ?? null,
    entityId: entry.entityId ?? null,
    entityLabel: entry.entityLabel ?? null,
    relatedType: entry.related?.type ?? null,
    relatedId: entry.related?.id ?? null,
    summary: entry.summary ?? summarise(entry, changes),
    changes,
    ipAddress: req?.ip ?? null,
    userAgent: req?.headers?.['user-agent']?.slice(0, 500) ?? null,
  };
}

function actorFromRequest(req) {
  const user = req?.user;
  if (!user) return null;
  const role = user.role ?? null;
  const kind = role === 'TEACHER' ? 'faculty' : role === 'PARENT' ? 'parent' : 'user';
  return { kind, id: user.id, name: user.name, role };
}

/** "Updated fee record · Aarav Verma (Class 5): status Due → Paid, paid amount 0 → 12000" */
function summarise(entry, changes) {
  const [, verbKey] = String(entry.action).split('.');
  const verb = VERBS[verbKey] ?? verbKey?.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase()) ?? 'Changed';
  const what = [entry.label ?? entry.entityType, entry.entityLabel].filter(Boolean).join(' · ');
  const detail = changes
    ? ': ' +
      Object.entries(changes)
        .slice(0, 6)
        .map(([key, { from, to }]) => `${words(key)} ${from} → ${to}`)
        .join(', ') +
      (Object.keys(changes).length > 6 ? ', …' : '')
    : '';
  return `${verb} ${what}${detail}`.trim();
}

/* ---------------------------------------------------------------
   Reading the log (admin only).
   --------------------------------------------------------------- */

export async function list(query = {}) {
  const { page, limit, skip, take } = toSkipTake(query);
  const where = buildWhere(query);
  const [items, total] = await Promise.all([
    auditLogRepository.findPaged(where, { skip, take }),
    auditLogRepository.count(where),
  ]);
  return { items, meta: buildMeta({ page, limit, total }) };
}

/** Everything about one record — a student's history, a teacher's history. */
export function historyFor(type, id, take = 100) {
  return auditLogRepository.findWhere(
    { OR: [{ entityType: type, entityId: Number(id) }, { relatedType: type, relatedId: Number(id) }] },
    { take }
  );
}

export function recent(take = 10) {
  return auditLogRepository.findWhere({}, { take });
}

export function buildWhere(query = {}) {
  const where = {};
  if (query.category) where.category = query.category;
  if (query.actorKind) where.actorKind = query.actorKind;
  if (query.actorId) where.actorId = Number(query.actorId);
  if (query.entityType && query.entityId) {
    where.OR = [
      { entityType: query.entityType, entityId: Number(query.entityId) },
      { relatedType: query.entityType, relatedId: Number(query.entityId) },
    ];
  }
  if (query.q) {
    const q = String(query.q).trim();
    where.AND = [{ OR: [{ summary: { contains: q } }, { entityLabel: { contains: q } }, { actorName: { contains: q } }] }];
  }
  if (query.from || query.to) {
    where.createdAt = {};
    if (query.from) where.createdAt.gte = new Date(query.from);
    if (query.to) {
      const to = new Date(query.to);
      to.setHours(23, 59, 59, 999);
      where.createdAt.lte = to;
    }
  }
  return where;
}
