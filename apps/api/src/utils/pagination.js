import { PAGINATION } from '../config/constants.js';

/**
 * Turns ?page & ?limit into Prisma's skip/take.
 * Clamped so a caller cannot request 100000 rows in one go.
 */
export function toSkipTake({ page, limit } = {}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(
    PAGINATION.maxLimit,
    Math.max(1, Number(limit) || PAGINATION.defaultLimit)
  );

  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
    take: safeLimit,
  };
}

/** The `meta` block returned alongside a paginated list. */
export function buildMeta({ page, limit, total }) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

export default toSkipTake;
