import { z } from 'zod';
import {
  NOTICE_CATEGORIES,
  DOWNLOAD_CATEGORIES,
  ACHIEVEMENT_TYPES,
  SETTING_GROUP_PATTERN,
} from '../config/constants.js';
import {
  optionalText,
  sortOrder,
  defaultedText,
  defaultedEnum,
  withDefault,
  multipartBoolean,
} from './common.validator.js';

// ---------- notices ----------

export const createNoticeSchema = z.object({
  title: z.string().trim().min(3, 'Give the notice a title').max(200),
  excerpt: optionalText(400),
  body: optionalText(20000),
  noticeDate: z.coerce.date({ errorMap: () => ({ message: 'Choose a valid date' }) }),
  category: defaultedEnum(NOTICE_CATEGORIES, 'general'),
  isPublished: z.boolean().default(true),
  isPinned: z.boolean().default(false),
  downloadId: z.coerce.number().int().positive().optional().nullable(),
});

export const updateNoticeSchema = createNoticeSchema.partial();

export const listNoticesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  category: z.enum(NOTICE_CATEGORIES).optional(),
  q: z.string().trim().max(120).optional(),
});

// ---------- announcements (ticker) ----------

export const createAnnouncementSchema = z.object({
  text: z.string().trim().min(3, 'Enter the announcement text').max(300),
  isActive: z.boolean().default(true),
  sortOrder: sortOrder.default(0),
  startsAt: z.coerce.date().optional().nullable(),
  endsAt: z.coerce.date().optional().nullable(),
});

export const updateAnnouncementSchema = createAnnouncementSchema.partial();

// ---------- gallery ----------

export const createAlbumSchema = z.object({
  title: z.string().trim().min(2, 'Give the album a title').max(150),
  description: optionalText(1000),
  eventDate: z.coerce.date().optional().nullable(),
  // Relative path of one of the album's own photos. Set automatically on the
  // first upload, and changeable from the admin panel afterwards.
  coverImage: optionalText(300),
  isPublished: z.boolean().default(true),
  sortOrder: sortOrder.default(0),
});

export const updateAlbumSchema = createAlbumSchema.partial();

// ---------- achievements ----------

export const createAchievementSchema = z.object({
  studentName: z.string().trim().min(2, 'Enter a name').max(150),
  classLabel: optionalText(50),
  score: optionalText(30),
  description: optionalText(1000),
  medal: defaultedText('🥇'),
  year: z.coerce.number().int().min(1950).max(2100).optional().nullable(),
  type: defaultedEnum(ACHIEVEMENT_TYPES, 'academic'),
  isFeatured: z.boolean().default(true),
  sortOrder: sortOrder.default(0),
});

export const updateAchievementSchema = createAchievementSchema.partial();

// ---------- faculty ----------

export const createFacultySchema = z.object({
  name: z.string().trim().min(2, 'Enter a name').max(150),
  designation: z.string().trim().min(2, 'Enter a designation').max(150),
  qualification: optionalText(200),
  subject: optionalText(150),
  message: optionalText(3000),
  // Relative path returned by POST /admin/uploads/faculty, e.g. "faculty/x.jpg".
  photo: optionalText(300),
  isPrincipal: z.boolean().default(false),
  isDirector: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  sortOrder: sortOrder.default(0),
});

export const updateFacultySchema = createFacultySchema.partial();

// ---------- facilities ----------

export const createFacilitySchema = z.object({
  title: z.string().trim().min(2, 'Enter a title').max(150),
  description: z.string().trim().min(2, 'Enter a description').max(1000),
  icon: defaultedText('🏫'),
  image: optionalText(300),
  isPublished: z.boolean().default(true),
  sortOrder: sortOrder.default(0),
});

export const updateFacilitySchema = createFacilitySchema.partial();

// ---------- streams ----------

export const createStreamSchema = z.object({
  title: z.string().trim().min(2, 'Enter a title').max(150),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers and hyphens')
    .max(150),
  description: z.string().trim().min(2, 'Enter a description').max(1000),
  subjects: z.array(z.string().trim().min(1).max(200)).min(1, 'List at least one subject'),
  emoji: defaultedText('📚'),
  isPublished: z.boolean().default(true),
  sortOrder: sortOrder.default(0),
});

export const updateStreamSchema = createStreamSchema.partial();

// ---------- academic stages ----------

export const createStageSchema = z.object({
  title: z.string().trim().min(2, 'Enter a title').max(150),
  classRange: z.string().trim().min(2, 'Enter the class range').max(100),
  description: z.string().trim().min(2, 'Enter a description').max(1000),
  emoji: defaultedText('📘'),
  accentColor: withDefault(
    z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, 'Use a hex colour like #e3a81c'),
    '#e3a81c'
  ),
  isPublished: z.boolean().default(true),
  sortOrder: sortOrder.default(0),
});

export const updateStageSchema = createStageSchema.partial();

// ---------- downloads ----------

/**
 * Reached through a multipart upload, so every field arrives as a string —
 * hence multipartBoolean rather than z.boolean().
 */
export const createDownloadSchema = z.object({
  title: z.string().trim().min(2, 'Enter a title').max(200),
  category: defaultedEnum(DOWNLOAD_CATEGORIES, 'general'),
  isPublic: multipartBoolean(true),
});

export const updateDownloadSchema = createDownloadSchema.partial();

// ---------- settings ----------

export const updateSettingsSchema = z.object({
  settings: z
    .array(
      z.object({
        key: z
          .string()
          .trim()
          .min(1)
          .max(100)
          .regex(/^[A-Za-z0-9_]+$/, 'Keys may use letters, numbers and underscores'),
        value: z.string().max(20000),
        group: z
          .string()
          .regex(SETTING_GROUP_PATTERN, 'Unknown settings group')
          .optional(),
        label: optionalText(150),
      })
    )
    .min(1, 'Send at least one setting'),
});

// ---------- internal school management ----------

export const createStudentSchema = z.object({
  name: z.string().trim().min(2).max(150),
  classGroup: z.string().trim().min(1).max(80),
  rollNumber: optionalText(50),
  guardianName: z.string().trim().min(2).max(150),
  phone: optionalText(30),
  address: optionalText(2000),
});
export const updateStudentSchema = createStudentSchema.partial();

export const createHomeworkSchema = z.object({
  title: z.string().trim().min(2).max(200),
  classGroup: z.string().trim().min(1).max(80),
  subject: z.string().trim().min(2).max(120),
  dueDate: z.coerce.date().optional().nullable(),
  description: optionalText(5000),
  isPublished: z.boolean().default(false),
});
export const updateHomeworkSchema = createHomeworkSchema.partial();

export const createResultSchema = z.object({
  studentName: z.string().trim().min(2).max(150),
  classGroup: z.string().trim().min(1).max(80),
  exam: z.string().trim().min(2).max(150),
  score: z.string().trim().min(1).max(100),
  resultDate: z.coerce.date().optional().nullable(),
  remarks: optionalText(2000),
  isPublished: z.boolean().default(false),
});
export const updateResultSchema = createResultSchema.partial();

export const createFeeRecordSchema = z.object({
  studentName: z.string().trim().min(2).max(150),
  classGroup: z.string().trim().min(1).max(80),
  amount: z.coerce.number().positive().max(10000000),
  dueDate: z.coerce.date().optional().nullable(),
  status: defaultedEnum(['DUE', 'PAID', 'PARTIAL'], 'DUE'),
  notes: optionalText(2000),
});
export const updateFeeRecordSchema = createFeeRecordSchema.partial();

export const createFacultySalarySchema = z.object({
  facultyName: z.string().trim().min(2).max(150),
  month: z.string().trim().min(3).max(40),
  amount: z.coerce.number().positive().max(10000000),
  paymentDate: z.coerce.date().optional().nullable(),
  status: defaultedEnum(['DUE', 'PAID'], 'DUE'),
  notes: optionalText(2000),
});
export const updateFacultySalarySchema = createFacultySalarySchema.partial();

export const createJobApplicationSchema = z.object({
  name: z.string().trim().min(2).max(150),
  position: z.string().trim().min(2).max(150),
  email: z.string().trim().email().optional().nullable(),
  phone: optionalText(30),
  status: defaultedEnum(['NEW', 'REVIEWING', 'SHORTLISTED', 'CLOSED'], 'NEW'),
  notes: optionalText(5000),
});
export const updateJobApplicationSchema = createJobApplicationSchema.partial();
export const createPublicJobApplicationSchema = createJobApplicationSchema.pick({
  name: true,
  position: true,
  email: true,
  phone: true,
  notes: true,
});

export const createPolicySchema = z.object({
  title: z.string().trim().min(2).max(200),
  effectiveDate: z.coerce.date().optional().nullable(),
  status: defaultedEnum(['DRAFT', 'ACTIVE', 'ARCHIVED'], 'DRAFT'),
  content: z.string().trim().min(2).max(50000),
});
export const updatePolicySchema = createPolicySchema.partial();

// ---------- users ----------

export const createUserSchema = z.object({
  name: z.string().trim().min(2, 'Enter a name').max(120),
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'Use at least 8 characters')
    .regex(/[a-zA-Z]/, 'Include at least one letter')
    .regex(/[0-9]/, 'Include at least one number'),
  role: defaultedEnum(['ADMIN', 'EDITOR'], 'EDITOR'),
  isActive: z.boolean().default(true),
});

/**
 * Editing a user leaves the password box blank to keep the current one, which
 * arrives as null — so it is stripped rather than validated.
 */
export const updateUserSchema = createUserSchema.partial().extend({
  password: z.preprocess(
    (value) => (value === null || value === '' ? undefined : value),
    z
      .string()
      .min(8, 'Use at least 8 characters')
      .regex(/[a-zA-Z]/, 'Include at least one letter')
      .regex(/[0-9]/, 'Include at least one number')
      .optional()
  ),
});
