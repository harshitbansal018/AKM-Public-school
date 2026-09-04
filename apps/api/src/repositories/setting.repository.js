import { prisma } from '../config/prisma.js';

export function findAll() {
  return prisma.setting.findMany({ orderBy: [{ group: 'asc' }, { key: 'asc' }] });
}

export function findByKey(key) {
  return prisma.setting.findUnique({ where: { key } });
}

/**
 * Insert-or-update a batch of settings in one transaction, so a partial save
 * can never leave the site showing a mix of old and new contact details.
 *
 * @param {{key: string, value: string, group?: string, label?: string}[]} entries
 */
export function upsertMany(entries) {
  return prisma.$transaction(
    entries.map(({ key, value, group = 'general', label = null }) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: String(value), group, label },
        create: { key, value: String(value), group, label },
      })
    )
  );
}

export function remove(key) {
  return prisma.setting.delete({ where: { key } });
}
