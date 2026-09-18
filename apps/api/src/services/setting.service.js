import { settingRepository } from '../repositories/index.js';
import { serializeSettings } from '../serializers/index.js';
import { SETTING_GROUP_PATTERN } from '../config/constants.js';
import { normaliseMapEmbed } from '../utils/mapEmbed.js';
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
/**
 * Per-key clean-up applied before a value is stored, so the database only ever
 * holds something the website can actually render.
 */
const TRANSFORMS = {
  mapEmbedUrl: normaliseMapEmbed,
};

export async function updateMany(entries) {
  const invalid = entries.find((entry) => entry.group && !SETTING_GROUP_PATTERN.test(entry.group));
  if (invalid) throw ApiError.badRequest(`Unknown settings group: ${invalid.group}`);

  const cleaned = entries.map((entry) => {
    const transform = TRANSFORMS[entry.key];
    return transform ? { ...entry, value: transform(entry.value) } : entry;
  });

  await settingRepository.upsertMany(cleaned);
  return getPublicSettings();
}

/* ---------------------------------------------------------------
   Classes & sections.

   Students, homework, results, fees and teachers' assigned classes all carry a
   class label, and they only line up if it is the *same* label. So the list is
   configured once (the `class_sections` setting, one per line) and every save
   resolves its class against it — "10", "class 10" and "Class-10" all become
   the configured "Class 10", and an unknown class is refused.
   --------------------------------------------------------------- */

export const CLASS_SECTIONS_KEY = 'class_sections';

const DEFAULT_CLASS_SECTIONS = [
  'Nursery',
  'LKG',
  'UKG',
  ...Array.from({ length: 12 }, (_, index) => `Class ${index + 1}`),
];

/** "Class 10-A" / "class 10 a" / "10A" -> "10a", so spelling differences collapse. */
const classKey = (label) =>
  String(label)
    .toLowerCase()
    .replace(/^\s*class\s*/, '')
    .replace(/[^a-z0-9]/g, '');

/** The configured list in display order, or the default until one is saved. */
export async function listClassSections() {
  const row = await settingRepository.findByKey(CLASS_SECTIONS_KEY);
  const configured = String(row?.value ?? '')
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);
  return configured.length ? configured : DEFAULT_CLASS_SECTIONS;
}

/** The configured label for whatever spelling was typed, or a 400 if there is none. */
export async function resolveClassGroup(input) {
  const sections = await listClassSections();
  const match = sections.find((section) => classKey(section) === classKey(input));
  if (!match) {
    throw ApiError.badRequest(
      `"${String(input).trim()}" is not one of the school's classes. ` +
        'Add it under Website content → Classes & sections first.'
    );
  }
  return match;
}

/** Resolves a whole list, dropping duplicates, keeping the configured order. */
export async function resolveClassGroups(inputs = []) {
  const resolved = await Promise.all(inputs.map(resolveClassGroup));
  const sections = await listClassSections();
  return sections.filter((section) => resolved.includes(section));
}

/* ---------------------------------------------------------------
   Policy tabs — the headings on the website's Policies page. The office adds
   as many as it likes (one per line); every policy is filed under one.
   --------------------------------------------------------------- */

export const POLICY_TABS_KEY = 'policy_tabs';

const DEFAULT_POLICY_TABS = [
  'Student Policies',
  'Teacher / Faculty Policies',
  'School Rules & Regulations',
  'Attendance / Leave Rules',
  'Academic / Examination Rules',
];

/** The configured tabs in display order, or the default set until one is saved. */
export async function listPolicyTabs() {
  const row = await settingRepository.findByKey(POLICY_TABS_KEY);
  const configured = String(row?.value ?? '')
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);
  return configured.length ? configured : DEFAULT_POLICY_TABS;
}

/** The configured tab for whatever was typed (case-insensitive), or a 400. */
export async function resolvePolicyTab(input) {
  const tabs = await listPolicyTabs();
  const wanted = String(input ?? '').trim().toLowerCase();
  const match = tabs.find((tab) => tab.toLowerCase() === wanted);
  if (!match) {
    throw ApiError.badRequest(
      `"${String(input).trim()}" is not one of the Policies page tabs. ` +
        'Add it under Website content → Policies page first.'
    );
  }
  return match;
}

/* ---------------------------------------------------------------
   Subjects — offered wherever a subject is chosen (homework, results). Free
   text is still accepted, but a spelling that matches the list is snapped
   to it so "maths", "Maths" and "Mathematics" do not become three subjects.
   --------------------------------------------------------------- */

export const SUBJECTS_KEY = 'subjects';

const DEFAULT_SUBJECTS = [
  'English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Computer Science',
  'Environmental Studies', 'Sanskrit', 'Physics', 'Chemistry', 'Biology',
  'Economics', 'Accountancy', 'Business Studies', 'Political Science',
  'History', 'Geography', 'Physical Education', 'Art',
];

export async function listSubjects() {
  const row = await settingRepository.findByKey(SUBJECTS_KEY);
  const configured = String(row?.value ?? '')
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);
  return configured.length ? configured : DEFAULT_SUBJECTS;
}

/** The configured spelling if there is one, else the value as typed. */
export async function normaliseSubject(input) {
  const wanted = String(input ?? '').trim();
  if (!wanted) return wanted;
  const subjects = await listSubjects();
  return subjects.find((subject) => subject.toLowerCase() === wanted.toLowerCase()) ?? wanted;
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
