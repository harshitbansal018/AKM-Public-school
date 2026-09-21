/**
 * Admin controllers for the resources that need more than plain CRUD:
 * dashboard, notices, enquiries, gallery, downloads, settings and users.
 *
 * The five simple content resources are handled by crud.controller.js instead.
 */
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendOk } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { toFileUrl } from '../../utils/fileUrl.js';
import * as dashboardService from '../../services/dashboard.service.js';
import * as noticeService from '../../services/notice.service.js';
import * as enquiryService from '../../services/enquiry.service.js';
import * as galleryService from '../../services/gallery.service.js';
import * as downloadService from '../../services/download.service.js';
import * as settingService from '../../services/setting.service.js';
import * as announcementService from '../../services/announcement.service.js';
import * as userService from '../../services/user.service.js';
import { facultySalaryService, jobApplicationService, feeRecordService } from '../../services/internalRecords.service.js';
import { sendUploadedFile } from '../../utils/fileUrl.js';
import * as reportService from '../../services/report.service.js';
import * as resultService from '../../services/result.service.js';

// ---------- dashboard ----------

export const getDashboard = asyncHandler(async (_req, res) => {
  sendOk(res, await dashboardService.getSummary(), 'Dashboard summary');
});

// ---------- notices ----------

export const listNotices = asyncHandler(async (req, res) => {
  const { items, meta } = await noticeService.listAll(req.validatedQuery ?? req.query);
  sendOk(res, { items, meta }, 'Notices', 200, meta);
});

export const getNotice = asyncHandler(async (req, res) => {
  sendOk(res, await noticeService.getById(req.params.id), 'Notice');
});

export const createNotice = asyncHandler(async (req, res) => {
  sendOk(res, await noticeService.create(req.body, req.user.id), 'Notice created', 201);
});

export const updateNotice = asyncHandler(async (req, res) => {
  sendOk(res, await noticeService.update(req.params.id, req.body), 'Notice updated');
});

export const publishNotice = asyncHandler(async (req, res) => {
  const isPublished = Boolean(req.body.isPublished);
  const notice = await noticeService.setPublished(req.params.id, isPublished);
  sendOk(res, notice, isPublished ? 'Notice published' : 'Notice unpublished');
});

export const deleteNotice = asyncHandler(async (req, res) => {
  sendOk(res, await noticeService.remove(req.params.id), 'Notice deleted');
});

// ---------- announcements ----------

export const listAnnouncements = asyncHandler(async (_req, res) => {
  sendOk(res, await announcementService.listAll(), 'Announcements');
});

export const createAnnouncement = asyncHandler(async (req, res) => {
  sendOk(res, await announcementService.create(req.body), 'Announcement created', 201);
});

export const updateAnnouncement = asyncHandler(async (req, res) => {
  sendOk(res, await announcementService.update(req.params.id, req.body), 'Announcement updated');
});

export const deleteAnnouncement = asyncHandler(async (req, res) => {
  sendOk(res, await announcementService.remove(req.params.id), 'Announcement deleted');
});

export const reorderAnnouncements = asyncHandler(async (req, res) => {
  sendOk(res, await announcementService.reorder(req.body.ids), 'Order saved');
});

// ---------- enquiries ----------

export const listEnquiries = asyncHandler(async (req, res) => {
  const { items, meta } = await enquiryService.list(req.validatedQuery ?? req.query);
  sendOk(res, { items, meta }, 'Enquiries', 200, meta);
});

export const getEnquiry = asyncHandler(async (req, res) => {
  sendOk(res, await enquiryService.getById(req.params.id), 'Enquiry');
});

export const updateEnquiry = asyncHandler(async (req, res) => {
  sendOk(res, await enquiryService.updateStatus(req.params.id, req.body), 'Enquiry updated');
});

export const deleteEnquiry = asyncHandler(async (req, res) => {
  sendOk(res, await enquiryService.remove(req.params.id), 'Enquiry deleted');
});

export const exportEnquiries = asyncHandler(async (_req, res) => {
  const csv = await enquiryService.toCsv();
  const stamp = new Date().toISOString().slice(0, 10);

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="enquiries-${stamp}.csv"`);
  res.send(csv); // the CSV helper already prefixes the UTF-8 BOM for Excel
});

// ---------- gallery ----------

export const listAlbums = asyncHandler(async (_req, res) => {
  sendOk(res, await galleryService.listAll(), 'Albums');
});

export const getAlbum = asyncHandler(async (req, res) => {
  sendOk(res, await galleryService.getById(req.params.id), 'Album');
});

export const createAlbum = asyncHandler(async (req, res) => {
  sendOk(res, await galleryService.createAlbum(req.body), 'Album created', 201);
});

export const updateAlbum = asyncHandler(async (req, res) => {
  sendOk(res, await galleryService.updateAlbum(req.params.id, req.body), 'Album updated');
});

export const deleteAlbum = asyncHandler(async (req, res) => {
  sendOk(res, await galleryService.removeAlbum(req.params.id), 'Album deleted');
});

export const addAlbumImages = asyncHandler(async (req, res) => {
  const captions = [].concat(req.body.captions ?? []);
  const album = await galleryService.addImages(req.params.id, req.files, captions);
  sendOk(res, album, `${req.files?.length ?? 0} image(s) added`, 201);
});

export const deleteAlbumImage = asyncHandler(async (req, res) => {
  sendOk(res, await galleryService.removeImage(req.params.imageId), 'Image deleted');
});

export const reorderAlbumImages = asyncHandler(async (req, res) => {
  sendOk(res, await galleryService.reorderImages(req.body.ids), 'Order saved');
});

// ---------- downloads ----------

export const listDownloads = asyncHandler(async (_req, res) => {
  sendOk(res, await downloadService.listAll(), 'Downloads');
});

export const createDownload = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('Attach a file to upload');

  const created = await downloadService.create({
    ...req.body,
    filePath: `downloads/${req.file.filename}`,
    fileSize: req.file.size,
    mimeType: req.file.mimetype,
  });

  sendOk(res, created, 'Download added', 201);
});

export const updateDownload = asyncHandler(async (req, res) => {
  sendOk(res, await downloadService.update(req.params.id, req.body), 'Download updated');
});

export const deleteDownload = asyncHandler(async (req, res) => {
  sendOk(res, await downloadService.remove(req.params.id), 'Download deleted');
});

// ---------- settings ----------

export const getSettings = asyncHandler(async (_req, res) => {
  sendOk(res, await settingService.getAdminSettings(), 'Settings');
});

export const updateSettings = asyncHandler(async (req, res) => {
  sendOk(res, await settingService.updateMany(req.body.settings), 'Settings saved');
});

// ---------- reports / print ----------

export const listReports = asyncHandler(async (_req, res) => {
  sendOk(res, await reportService.listReports(), 'Reports');
});

/**
 * One report. `?format=csv` downloads an Excel-friendly file; otherwise the
 * rows come back as JSON for the print-friendly page.
 */
export const runReport = asyncHandler(async (req, res) => {
  const { format, ...filters } = req.validatedQuery ?? req.query;
  const report = await reportService.runReport(req.params.key, filters);

  if (format === 'csv') {
    const stamp = report.generatedAt.toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${report.key}-${stamp}.csv"`);
    return res.send(report.csv());
  }

  const { csv, ...json } = report;
  return sendOk(res, json, report.label);
});

// ---------- job applications ----------

/** The applicant's CV. Only reachable signed in — the resumes folder is not static. */
export const downloadResume = asyncHandler(async (req, res) => {
  const { relativePath, filename } = await jobApplicationService.resolveResume(req.params.id);
  await sendUploadedFile(res, relativePath, filename);
});

// ---------- fees ----------

/** Emails the linked parent a reminder for one pending fee. */
export const remindFee = asyncHandler(async (req, res) => {
  const result = await feeRecordService.sendReminder(req.params.id);
  sendOk(res, result, `Reminder emailed to ${result.parentName} (${result.to})`);
});

// ---------- faculty salary ----------

export const paySalary = asyncHandler(async (req, res) => {
  sendOk(res, await facultySalaryService.markPaid(req.params.id, req.body.paymentDate), 'Salary marked as paid');
});

/** The subject dropdown for homework and results. */
export const listSubjects = asyncHandler(async (_req, res) => {
  sendOk(res, await settingService.listSubjects(), 'Subjects');
});

// ---------- results: marks grid ----------

export const getMarksGrid = asyncHandler(async (req, res) => {
  sendOk(res, await resultService.loadMarksGrid(req.validatedQuery), 'Marks grid');
});

export const saveMarksGrid = asyncHandler(async (req, res) => {
  sendOk(res, await resultService.saveMarksGrid(req.body), 'Marks saved');
});

/** The Policies page tabs — the dropdown a policy is filed under. */
export const listPolicyTabs = asyncHandler(async (_req, res) => {
  sendOk(res, await settingService.listPolicyTabs(), 'Policy tabs');
});

/** The class/section dropdown used by every form that files something under a class. */
export const listClassSections = asyncHandler(async (_req, res) => {
  sendOk(res, await settingService.listClassSections(), 'Classes & sections');
});

// ---------- users ----------

export const listUsers = asyncHandler(async (_req, res) => {
  sendOk(res, await userService.list(), 'Users');
});

export const createUser = asyncHandler(async (req, res) => {
  sendOk(res, await userService.create(req.body), 'User created', 201);
});

export const updateUser = asyncHandler(async (req, res) => {
  sendOk(res, await userService.update(req.params.id, req.body), 'User updated');
});

export const deleteUser = asyncHandler(async (req, res) => {
  sendOk(res, await userService.remove(req.params.id, req.user.id), 'User deleted');
});

// ---------- uploads ----------

/** A homework worksheet (PDF / Word): stored publicly under uploads/homework. */
export const uploadHomeworkAttachment = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No file was uploaded');
  sendOk(
    res,
    {
      path: `homework/${req.file.filename}`,
      url: toFileUrl(`homework/${req.file.filename}`),
      name: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
    },
    'File uploaded',
    201
  );
});

export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No file was uploaded');

  sendOk(
    res,
    {
      filename: req.file.filename,
      // req.uploadFolder is where the file actually landed, which is not
      // necessarily what the URL asked for — unknown folders fall back to misc.
      path: `${req.uploadFolder ?? 'misc'}/${req.file.filename}`,
      url: toFileUrl(`${req.uploadFolder ?? 'misc'}/${req.file.filename}`),
      size: req.file.size,
      mimeType: req.file.mimetype,
    },
    'File uploaded',
    201
  );
});
