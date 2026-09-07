export const ROLES = {
  ADMIN: 'ADMIN',
  EDITOR: 'EDITOR',
};

export const ENQUIRY_STATUS = {
  NEW: 'NEW',
  CONTACTED: 'CONTACTED',
  ADMITTED: 'ADMITTED',
  CLOSED: 'CLOSED',
};

export const MEDIUM = {
  ENGLISH: 'ENGLISH',
  HINDI: 'HINDI',
  BOTH: 'BOTH',
};

/** Values the enquiry form's class dropdown may send. */
export const CLASS_GROUPS = [
  'NURSERY_UKG',
  'CLASS_1_5',
  'CLASS_6_8',
  'CLASS_9_10',
  'CLASS_11_12',
];

export const NOTICE_CATEGORIES = ['general', 'exam', 'admission', 'result', 'event'];

export const DOWNLOAD_CATEGORIES = ['general', 'datesheet', 'syllabus', 'form', 'result'];

/**
 * Site-wide setting buckets. Per-page copy uses `page_<name>` groups
 * (page_about, page_academics, …) which are validated by pattern instead, so a
 * new page does not need a code change here.
 */
export const SETTING_GROUPS = ['general', 'contact', 'stats', 'social', 'seo'];

/** Accepts the fixed groups above plus any `page_<name>` group. */
export const SETTING_GROUP_PATTERN = /^(general|contact|stats|social|seo|page_[a-z0-9_]+)$/;

export const ACHIEVEMENT_TYPES = ['academic', 'sports', 'cultural'];

/** Subfolders under uploads/ that the API will write to. */
export const UPLOAD_FOLDERS = ['gallery', 'faculty', 'achievements', 'downloads', 'misc'];

export const PAGINATION = {
  defaultLimit: 10,
  maxLimit: 100,
};
