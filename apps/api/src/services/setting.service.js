import { settingRepository } from '../repositories/index.js';
import { serializeSettings } from '../serializers/index.js';
import { SETTING_GROUPS } from '../config/constants.js';
import { ApiError } from '../utils/ApiError.js';

/** Flat { key: value } object for the public site. */
export async function getPublicSettings() {
  return serializeSettings(await settingRepository.findAll());
}

/** Grouped rows for the admin settings screen. */
export async function getAdminSettings() {
  const rows = await settingRepository.findAll();
  return rows.reduce((groups, row) => {
    (groups[row.group] ||= []).push(row);
    return groups;
  }, {});
}

/**
 * @param {{key: string, value: string, group?: string, label?: string}[]} entries
 */
export async function updateMany(entries) {
  const invalid = entries.find((entry) => entry.group && !SETTING_GROUPS.includes(entry.group));
  if (invalid) throw ApiError.badRequest(`Unknown settings group: ${invalid.group}`);

  await settingRepository.upsertMany(entries);
  return getPublicSettings();
}

/**
 * The four homepage counters, pulled out of settings and coerced to numbers so
 * the frontend never has to parse strings.
 */
export async function getStats() {
  const settings = await getPublicSettings();

  return [
    { id: 1, value: Number(settings.stat_students ?? 0), suffix: '+', label: 'Students' },
    { id: 2, value: Number(settings.stat_teachers ?? 0), suffix: '', label: 'Dedicated Teachers' },
    { id: 3, value: Number(settings.stat_streams ?? 0), suffix: '', label: 'Senior Sec. Streams' },
    { id: 4, value: Number(settings.stat_classes ?? 0), suffix: '', label: 'Classes: Nursery–12' },
  ];
}
