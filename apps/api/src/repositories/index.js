/**
 * Repository layer — the ONLY place `prisma` is imported.
 *
 * Services import from here, never from '../config/prisma.js'. Keeping that
 * boundary is what makes the data layer swappable and the business logic
 * testable without a database.
 */
import { createRepository } from './createRepository.js';

export * as userRepository from './user.repository.js';
export * as settingRepository from './setting.repository.js';
export * as announcementRepository from './announcement.repository.js';
export * as noticeRepository from './notice.repository.js';
export * as enquiryRepository from './enquiry.repository.js';
export * as galleryRepository from './gallery.repository.js';
export * as downloadRepository from './download.repository.js';

/**
 * The simple sorted-list tables. Same shape, so they share one implementation
 * rather than five copies of the same twenty lines.
 */
export const facilityRepository = createRepository('facility');
export const streamRepository = createRepository('stream');
export const academicStageRepository = createRepository('academicStage');
export const facultyRepository = createRepository('faculty');
export const achievementRepository = createRepository('achievement', {
  orderBy: [{ sortOrder: 'asc' }, { year: 'desc' }, { id: 'desc' }],
  publishedField: 'isFeatured',
});

/** Internal management tables — independent so they remain queryable and extensible. */
export const studentRepository = createRepository('student', { orderBy: [{ id: 'desc' }], publishedField: null });
export const homeworkRepository = createRepository('homework', { orderBy: [{ dueDate: 'desc' }, { id: 'desc' }] });
export const resultRepository = createRepository('result', { orderBy: [{ resultDate: 'desc' }, { id: 'desc' }] });
export const feeRecordRepository = createRepository('feeRecord', { orderBy: [{ dueDate: 'desc' }, { id: 'desc' }], publishedField: null });
export const facultySalaryRepository = createRepository('facultySalary', { orderBy: [{ paymentDate: 'desc' }, { id: 'desc' }], publishedField: null });
export const jobApplicationRepository = createRepository('jobApplication', { orderBy: [{ id: 'desc' }], publishedField: null });
export const policyRepository = createRepository('policy', { orderBy: [{ id: 'desc' }], publishedField: null });
