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
export const UPLOAD_FOLDERS = ['gallery', 'faculty', 'achievements', 'downloads', 'resumes', 'misc'];

/** Upload folders that are never served statically — only through an authenticated route. */
export const PRIVATE_UPLOAD_FOLDERS = ['resumes'];

/** The review flow for a job application, in order. */
export const JOB_APPLICATION_STATUSES = [
  'NEW',
  'UNDER_REVIEW',
  'SHORTLISTED',
  'INTERVIEW',
  'SELECTED',
  'REJECTED',
];

export const PAGINATION = {
  defaultLimit: 10,
  maxLimit: 100,
};
