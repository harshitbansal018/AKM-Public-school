import { z } from 'zod';
import {
  NOTICE_CATEGORIES,
  DOWNLOAD_CATEGORIES,
  ACHIEVEMENT_TYPES,
  SETTING_GROUP_PATTERN,
  JOB_APPLICATION_STATUSES,
} from '../config/constants.js';
import {
  optionalText,
  sortOrder,
  defaultedText,
  defaultedEnum,
  withDefault,
  multipartBoolean,
} from './common.validator.js';

/** Icons are stored as a LineIcon name, e.g. 'laptop' — never a raw character. */
const iconName = (fallback) =>
  withDefault(z.string().trim().regex(/^[a-z-]{2,40}$/, 'Choose an icon from the list'), fallback);

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
  medal: iconName('medal-gold'),
  year: z.coerce.number().int().min(1950).max(2100).optional().nullable(),
  type: defaultedEnum(ACHIEVEMENT_TYPES, 'academic'),
  isFeatured: z.boolean().default(true),
  sortOrder: sortOrder.default(0),
});

export const updateAchievementSchema = createAchievementSchema.partial();

// ---------- faculty ----------

const password = z
  .string()
  .min(8, 'Use at least 8 characters')
  .regex(/[a-zA-Z]/, 'Include at least one letter')
  .regex(/[0-9]/, 'Include at least one number');

/**
 * A blank password box means "keep the current one" and arrives as null or '',
 * so it is stripped rather than validated.
 */
const optionalPassword = z.preprocess(
  (value) => (value === null || value === '' ? undefined : value),
  password.optional()
);

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
  // Teacher-portal sign-in. The service checks that access is only switched on
  // for a member who has both an email and a password.
  accountEmail: z.string().trim().toLowerCase().email('Enter a valid email').optional().nullable(),
  password: optionalPassword,
  teacherAccess: z.boolean().default(false),
  assignedClasses: z.array(z.string().trim().min(1).max(80)).max(30).default([]),
  isPublished: z.boolean().default(true),
  sortOrder: sortOrder.default(0),
});

export const updateFacultySchema = createFacultySchema.partial();

// ---------- facilities ----------

export const createFacilitySchema = z.object({
  title: z.string().trim().min(2, 'Enter a title').max(150),
  description: z.string().trim().min(2, 'Enter a description').max(1000),
  icon: iconName('school'),
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
  icon: iconName('book'),
  isPublished: z.boolean().default(true),
  sortOrder: sortOrder.default(0),
});

export const updateStreamSchema = createStreamSchema.partial();

// ---------- academic stages ----------

export const createStageSchema = z.object({
  title: z.string().trim().min(2, 'Enter a title').max(150),
  classRange: z.string().trim().min(2, 'Enter the class range').max(100),
  description: z.string().trim().min(2, 'Enter a description').max(1000),
  icon: iconName('book'),
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

/** Parent-portal account. Children are linked from the student's record. */
export const createParentSchema = z.object({
  name: z.string().trim().min(2, 'Enter a name').max(150),
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  phone: optionalText(30),
  password,
  isActive: z.boolean().default(true),
});
export const updateParentSchema = createParentSchema.partial().extend({ password: optionalPassword });

/** Blank select → null, so "no parent linked" round-trips cleanly. */
const optionalId = z.preprocess(
  (value) => (value === '' || value === null || value === undefined ? null : value),
  z.coerce.number().int().positive().nullable()
);

export const createStudentSchema = z.object({
  name: z.string().trim().min(2).max(150),
  classGroup: z.string().trim().min(1).max(80),
  rollNumber: optionalText(50),
  guardianName: z.string().trim().min(2).max(150),
  phone: optionalText(30),
  address: optionalText(2000),
  parentId: optionalId.optional(),
});
export const updateStudentSchema = createStudentSchema.partial();

export const createHomeworkSchema = z.object({
  title: z.string().trim().min(2).max(200),
  classGroup: z.string().trim().min(1).max(80),
  subject: z.string().trim().min(2).max(120),
  dueDate: z.coerce.date().optional().nullable(),
  description: optionalText(5000),
  // Set from the upload endpoint's response; the path is checked to stay inside uploads/homework.
  attachmentPath: optionalText(300).refine(
    (value) => value === null || value === undefined || /^homework\/[a-z0-9.-]+$/i.test(value),
    'Upload the file through the form'
  ),
  attachmentName: optionalText(255),
  attachmentSize: z.coerce.number().int().min(0).optional().nullable(),
  isPublished: z.boolean().default(false),
});
export const updateHomeworkSchema = createHomeworkSchema.partial();

/**
 * Results and fees are filed against a registered student (`studentId`); the
 * service copies the student's name and class onto the row. Name + class are
 * still accepted on their own for records of students not in the register.
 */
const studentLink = {
  studentId: optionalId.optional(),
  studentName: z.string().trim().min(2).max(150).optional(),
  classGroup: z.string().trim().min(1).max(80).optional(),
};

const requireStudent = (data, ctx) => {
  if (!data.studentId && !(data.studentName && data.classGroup)) {
    ctx.addIssue({ code: 'custom', path: ['studentId'], message: 'Choose a student' });
  }
};

/** A blank number box arrives as '' or null — treat both as "not given". */
const optionalNumber = (max) =>
  z.preprocess(
    (value) => (value === '' || value === null || value === undefined ? null : value),
    z.coerce.number().min(0).max(max).nullable()
  );

/**
 * One result: a student, an examination and (usually) a subject with marks
 * out of a maximum. `score` is the text shown; when marks are given the
 * service derives it, otherwise it must be typed (a grade, say).
 */
export const createResultSchema = z
  .object({
    ...studentLink,
    exam: z.string().trim().min(2).max(150),
    subject: optionalText(120),
    marks: optionalNumber(100000).optional(),
    maxMarks: optionalNumber(100000).optional(),
    score: optionalText(100),
    resultDate: z.coerce.date().optional().nullable(),
    remarks: optionalText(2000),
    isPublished: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    requireStudent(data, ctx);
    if ((data.marks === null || data.marks === undefined) && !data.score) {
      ctx.addIssue({ code: 'custom', path: ['marks'], message: 'Enter the marks (or a grade in Score)' });
    }
    if (data.marks != null && data.maxMarks != null && data.marks > data.maxMarks) {
      ctx.addIssue({ code: 'custom', path: ['marks'], message: 'Marks cannot exceed the maximum' });
    }
  });
export const updateResultSchema = createResultSchema.innerType().partial();

/**
 * The marks grid: one examination for one class, several subjects, all the
 * students at once. Each cell is a student's marks in a subject (null = absent
 * / not entered, which leaves that cell out).
 */
export const marksGridQuerySchema = z.object({
  classGroup: z.string().trim().min(1).max(80),
  exam: z.string().trim().max(150).optional(),
});

export const marksGridSchema = z.object({
  classGroup: z.string().trim().min(1).max(80),
  exam: z.string().trim().min(2).max(150),
  resultDate: z.coerce.date().optional().nullable(),
  isPublished: z.boolean().default(false),
  subjects: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(120),
        maxMarks: z.coerce.number().positive().max(100000),
      })
    )
    .min(1, 'Choose at least one subject')
    .max(30),
  entries: z
    .array(
      z.object({
        studentId: z.coerce.number().int().positive(),
        marks: z.record(z.string(), optionalNumber(100000)),
      })
    )
    .min(1, 'There are no students in this class')
    .max(500),
});

export const createFeeRecordSchema = z
  .object({
    ...studentLink,
    amount: z.coerce.number().positive().max(10000000),
    paidAmount: withDefault(z.coerce.number().min(0).max(10000000), 0),
    dueDate: z.coerce.date().optional().nullable(),
    status: defaultedEnum(['DUE', 'PARTIAL', 'PAID'], 'DUE'),
    notes: optionalText(2000),
  })
  .superRefine(requireStudent);
export const updateFeeRecordSchema = createFeeRecordSchema.innerType().partial();

/** A salary month is filed against a faculty record; the name is copied from it. */
export const createFacultySalarySchema = z
  .object({
    facultyId: optionalId.optional(),
    facultyName: z.string().trim().min(2).max(150).optional(),
    month: z.string().trim().min(3).max(40),
    amount: z.coerce.number().positive().max(10000000),
    paymentDate: z.coerce.date().optional().nullable(),
    status: defaultedEnum(['DUE', 'PAID'], 'DUE'),
    notes: optionalText(2000),
  })
  .superRefine((data, ctx) => {
    if (!data.facultyId && !data.facultyName) {
      ctx.addIssue({ code: 'custom', path: ['facultyId'], message: 'Choose a faculty member' });
    }
  });
export const updateFacultySalarySchema = createFacultySalarySchema.innerType().partial();

/** Marking a salary as paid: today unless a date is given. */
export const paySalarySchema = z.object({
  paymentDate: z.coerce.date().optional().nullable(),
});

/**
 * The public Careers form. It arrives as multipart (the CV travels with it),
 * so every field is a string and a blank optional field is '' — optionalText
 * turns that into null.
 */
export const createPublicJobApplicationSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name').max(150),
  // Same rule as the enquiry form: any spacing/dashes/+91, but 10–13 real digits.
  phone: z
    .string()
    .trim()
    .max(20, 'Enter a valid phone number')
    .refine((value) => {
      const digits = value.replace(/\D/g, '');
      return digits.length >= 10 && digits.length <= 13;
    }, 'Enter a valid 10-digit phone number'),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  position: z.string().trim().min(2, 'Tell us the position you are applying for').max(150),
  subject: optionalText(150),
  qualification: z.string().trim().min(2, 'Enter your highest qualification').max(200),
  experience: optionalText(100),
  currentSchool: optionalText(200),
  address: optionalText(500),
  notes: optionalText(5000),
});

/** The office can file an application by hand too, and moves it through the statuses. */
export const createJobApplicationSchema = createPublicJobApplicationSchema
  .extend({
    email: z.string().trim().toLowerCase().email().optional().nullable(),
    phone: optionalText(30),
    qualification: optionalText(200),
    status: defaultedEnum(JOB_APPLICATION_STATUSES, 'NEW'),
    adminNote: optionalText(5000),
  });
export const updateJobApplicationSchema = createJobApplicationSchema.partial();

export const createPolicySchema = z.object({
  title: z.string().trim().min(2).max(200),
  category: z.string().trim().min(1, 'Choose a tab').max(80),
  effectiveDate: z.coerce.date().optional().nullable(),
  status: defaultedEnum(['DRAFT', 'ACTIVE', 'ARCHIVED'], 'DRAFT'),
  content: z.string().trim().min(2).max(50000),
});
export const updatePolicySchema = createPolicySchema.partial();

// ---------- reports ----------

export const reportQuerySchema = z.object({
  format: z.enum(['csv', 'json']).optional(),
  classGroup: z.string().trim().max(80).optional(),
  status: z.string().trim().max(30).optional(),
  from: z.string().regex(/^d{4}-d{2}-d{2}$/).optional(),
  to: z.string().regex(/^d{4}-d{2}-d{2}$/).optional(),
});

// ---------- users ----------

export const createUserSchema = z.object({
  name: z.string().trim().min(2, 'Enter a name').max(120),
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password,
  role: defaultedEnum(['ADMIN', 'EDITOR'], 'EDITOR'),
  isActive: z.boolean().default(true),
});

export const updateUserSchema = createUserSchema.partial().extend({ password: optionalPassword });
