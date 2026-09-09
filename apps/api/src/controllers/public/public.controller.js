/**
 * Public controllers.
 *
 * Every handler is the same three lines: read the request, call a service,
 * send the response. No business logic and no Prisma — that is what keeps this
 * layer readable and the services testable on their own.
 */
import fs from 'node:fs';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendOk } from '../../utils/ApiResponse.js';
import * as homeService from '../../services/home.service.js';
import * as settingService from '../../services/setting.service.js';
import * as announcementService from '../../services/announcement.service.js';
import * as noticeService from '../../services/notice.service.js';
import * as galleryService from '../../services/gallery.service.js';
import * as downloadService from '../../services/download.service.js';
import * as enquiryService from '../../services/enquiry.service.js';
import {
  academicStageService,
  streamService,
  facilityService,
  facultyService,
  achievementService,
} from '../../services/content.service.js';

export const getHome = asyncHandler(async (_req, res) => {
  sendOk(res, await homeService.getHomePayload(), 'Homepage content');
});

export const getSettings = asyncHandler(async (_req, res) => {
  sendOk(res, await settingService.getPublicSettings(), 'Site settings');
});

export const getAnnouncements = asyncHandler(async (_req, res) => {
  sendOk(res, await announcementService.listActive(), 'Active announcements');
});

export const getStages = asyncHandler(async (_req, res) => {
  sendOk(res, await academicStageService.listPublic(), 'Academic stages');
});

export const getStreams = asyncHandler(async (_req, res) => {
  const streams = await streamService.listPublic();
  sendOk(res, streams.map(homeService.withParsedSubjects), 'Streams');
});

export const getFacilities = asyncHandler(async (_req, res) => {
  sendOk(res, await facilityService.listPublic(), 'Facilities');
});

export const getFaculty = asyncHandler(async (_req, res) => {
  sendOk(res, await facultyService.listPublic(), 'Faculty');
});

export const getPrincipal = asyncHandler(async (_req, res) => {
  sendOk(res, await facultyService.getPrincipal(), 'Principal');
});

export const getAchievements = asyncHandler(async (req, res) => {
  const { year, type } = req.query;
  sendOk(res, await achievementService.listPublicFiltered({ year, type }), 'Achievements');
});

export const getNotices = asyncHandler(async (req, res) => {
  const { items, meta } = await noticeService.listPublished(req.validatedQuery ?? req.query);
  sendOk(res, { items, meta }, 'Notices', 200, meta);
});

export const getNoticeBySlug = asyncHandler(async (req, res) => {
  sendOk(res, await noticeService.getBySlug(req.params.slug), 'Notice');
});

export const getGallery = asyncHandler(async (_req, res) => {
  sendOk(res, await galleryService.listPublic(), 'Gallery albums');
});

export const getAlbumBySlug = asyncHandler(async (req, res) => {
  sendOk(res, await galleryService.getBySlug(req.params.slug), 'Album');
});

export const getDownloads = asyncHandler(async (req, res) => {
  sendOk(res, await downloadService.listPublic(req.query.category), 'Downloads');
});

/**
 * Streams a download and bumps its counter.
 *
 * `attachment` makes the browser save the file rather than trying to display
 * it, and the filename is the school's own title so it is recognisable in a
 * parent's Downloads folder.
 */
export const downloadFile = asyncHandler(async (req, res) => {
  const { absolutePath, filename, mimeType, size } = await downloadService.resolveFile(
    req.params.id
  );

  res.setHeader('Content-Type', mimeType);
  res.setHeader('Content-Length', size);
  res.setHeader(
    'Content-Disposition',
    // The plain filename covers old browsers; filename* carries anything
    // non-ASCII correctly.
    `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`
  );

  const stream = fs.createReadStream(absolutePath);
  // If the client disconnects mid-download, stop reading from disk.
  stream.on('error', () => res.destroy());
  res.on('close', () => stream.destroy());
  stream.pipe(res);
});

export const createEnquiry = asyncHandler(async (req, res) => {
  const result = await enquiryService.submit(req.body, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  sendOk(res, result, 'Thank you! The school will contact you shortly.', 201);
});
