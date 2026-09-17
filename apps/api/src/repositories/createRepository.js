import { prisma } from '../config/prisma.js';

/**
 * Standard CRUD for the "simple content" tables — facilities, streams,
 * academic stages, faculty, achievements. They all share the same shape:
 * a sorted, publishable list with no relations.
 *
 * Writing this once keeps five repositories at ~10 lines each instead of five
 * near-identical 80-line files that drift apart over time. Resources with real
 * behaviour (notices, gallery, enquiries) get their own hand-written file.
 *
 * @param {string} model            a key on the Prisma client, e.g. 'facility'
 * @param {object} [options]
 * @param {object[]} [options.orderBy]
 * @param {string}  [options.publishedField]  null if the model has no flag
 * @param {object}  [options.include]         relations to load with every row
 */
export function createRepository(model, options = {}) {
  const {
    orderBy = [{ sortOrder: 'asc' }, { id: 'asc' }],
    publishedField = 'isPublished',
    include,
  } = options;

  const delegate = () => prisma[model];

  return {
    /** Public list — only published rows. */
    findPublished() {
      return delegate().findMany({
        where: publishedField ? { [publishedField]: true } : undefined,
        orderBy,
        include,
      });
    },

    /** Admin list — everything, drafts included. */
    findAll() {
      return delegate().findMany({ orderBy, include });
    },

    findById(id) {
      return delegate().findUnique({ where: { id: Number(id) }, include });
    },

    /** Filtered list in the default order, e.g. the rows for one class. */
    findWhere(where, { take } = {}) {
      return delegate().findMany({ where, orderBy, take, include });
    },

    findFirst(where) {
      return delegate().findFirst({ where, include });
    },

    create(data) {
      return delegate().create({ data, include });
    },

    update(id, data) {
      return delegate().update({ where: { id: Number(id) }, data, include });
    },

    remove(id) {
      return delegate().delete({ where: { id: Number(id) } });
    },

    count(where = {}) {
      return delegate().count({ where });
    },

    /** Applies a new sort order in one transaction so the list never half-moves. */
    reorder(orderedIds) {
      return prisma.$transaction(
        orderedIds.map((id, index) =>
          delegate().update({ where: { id: Number(id) }, data: { sortOrder: index } })
        )
      );
    },
  };
}

export default createRepository;
