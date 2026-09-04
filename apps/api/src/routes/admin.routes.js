import { Router } from 'express';

import * as authController from '../controllers/admin/auth.controller.js';
import * as admin from '../controllers/admin/admin.controller.js';
import { createCrudController } from '../controllers/admin/crud.controller.js';

import {
  facilityService,
  streamService,
  academicStageService,
  facultyService,
  achievementService,
} from '../services/content.service.js';

import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { loginLimiter } from '../middlewares/rateLimit.middleware.js';
import { revalidateOnWrite } from '../middlewares/revalidate.middleware.js';
import { uploadImage, uploadImages, uploadDocument } from '../middlewares/upload.middleware.js';

import { idParamSchema, reorderSchema } from '../validators/common.validator.js';
import { loginSchema, changePasswordSchema } from '../validators/auth.validator.js';
import { listEnquiriesSchema, updateEnquirySchema } from '../validators/enquiry.validator.js';
import * as schema from '../validators/content.validator.js';

const router = Router();
const id = validate(idParamSchema, 'params');

/* ---------------------------------------------------------------
   Auth — the only routes in this file that are reachable signed out.
   --------------------------------------------------------------- */
router.post('/auth/login', loginLimiter, validate(loginSchema), authController.login);
router.post('/auth/refresh', authController.refresh);
router.post('/auth/logout', authController.logout);
router.get('/auth/me', authenticate, authController.me);
router.patch(
  '/auth/password',
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword
);

/* ---------------------------------------------------------------
   Everything below requires a signed-in user.
   --------------------------------------------------------------- */
router.use(authenticate);

// Any successful write below busts the matching caches on the public site.
router.use(revalidateOnWrite);

router.get('/dashboard', admin.getDashboard);

// ---------- notices ----------
router.get('/notices', validate(schema.listNoticesSchema, 'query'), admin.listNotices);
router.post('/notices', validate(schema.createNoticeSchema), admin.createNotice);
router.get('/notices/:id', id, admin.getNotice);
router.put('/notices/:id', id, validate(schema.updateNoticeSchema), admin.updateNotice);
router.patch('/notices/:id/publish', id, admin.publishNotice);
router.delete('/notices/:id', id, admin.deleteNotice);

// ---------- announcements (ticker) ----------
router.get('/announcements', admin.listAnnouncements);
router.post('/announcements', validate(schema.createAnnouncementSchema), admin.createAnnouncement);
router.patch('/announcements/reorder', validate(reorderSchema), admin.reorderAnnouncements);
router.put(
  '/announcements/:id',
  id,
  validate(schema.updateAnnouncementSchema),
  admin.updateAnnouncement
);
router.delete('/announcements/:id', id, admin.deleteAnnouncement);

// ---------- enquiries ----------
router.get('/enquiries', validate(listEnquiriesSchema, 'query'), admin.listEnquiries);
router.get('/enquiries/export', admin.exportEnquiries);
router.get('/enquiries/:id', id, admin.getEnquiry);
router.patch('/enquiries/:id', id, validate(updateEnquirySchema), admin.updateEnquiry);
router.delete('/enquiries/:id', id, admin.deleteEnquiry);

// ---------- gallery ----------
router.get('/gallery', admin.listAlbums);
router.post('/gallery', validate(schema.createAlbumSchema), admin.createAlbum);
router.delete('/gallery/images/:imageId', admin.deleteAlbumImage);
router.get('/gallery/:id', id, admin.getAlbum);
router.put('/gallery/:id', id, validate(schema.updateAlbumSchema), admin.updateAlbum);
router.delete('/gallery/:id', id, admin.deleteAlbum);
router.post('/gallery/:id/images', id, uploadImages('gallery'), admin.addAlbumImages);
router.patch('/gallery/:id/images/reorder', id, validate(reorderSchema), admin.reorderAlbumImages);

// ---------- downloads ----------
router.get('/downloads', admin.listDownloads);
router.post(
  '/downloads',
  uploadDocument('downloads'),
  validate(schema.createDownloadSchema),
  admin.createDownload
);
router.put('/downloads/:id', id, validate(schema.updateDownloadSchema), admin.updateDownload);
router.delete('/downloads/:id', id, admin.deleteDownload);

/* ---------------------------------------------------------------
   The five simple content resources. Same handlers, same shape —
   built from one factory rather than five copies of the same file.
   --------------------------------------------------------------- */
const resources = [
  ['facilities', facilityService, 'Facility', schema.createFacilitySchema, schema.updateFacilitySchema],
  ['streams', streamService, 'Stream', schema.createStreamSchema, schema.updateStreamSchema],
  ['academic-stages', academicStageService, 'Stage', schema.createStageSchema, schema.updateStageSchema],
  ['faculty', facultyService, 'Faculty member', schema.createFacultySchema, schema.updateFacultySchema],
  ['achievements', achievementService, 'Achievement', schema.createAchievementSchema, schema.updateAchievementSchema],
];

for (const [path, service, label, createSchema, updateSchema] of resources) {
  const c = createCrudController(service, label);
  router.get(`/${path}`, c.list);
  router.post(`/${path}`, validate(createSchema), c.create);
  router.patch(`/${path}/reorder`, validate(reorderSchema), c.reorder);
  router.get(`/${path}/:id`, id, c.get);
  router.put(`/${path}/:id`, id, validate(updateSchema), c.update);
  router.delete(`/${path}/:id`, id, c.remove);
}

// ---------- settings ----------
router.get('/settings', admin.getSettings);
router.put('/settings', validate(schema.updateSettingsSchema), admin.updateSettings);

// ---------- uploads ----------
router.post('/uploads/:folder', uploadImage('misc'), admin.uploadFile);

/* ---------------------------------------------------------------
   Managing accounts is administrator-only, even for signed-in editors.
   --------------------------------------------------------------- */
router.get('/users', requireRole('ADMIN'), admin.listUsers);
router.post('/users', requireRole('ADMIN'), validate(schema.createUserSchema), admin.createUser);
router.put(
  '/users/:id',
  requireRole('ADMIN'),
  id,
  validate(schema.updateUserSchema),
  admin.updateUser
);
router.delete('/users/:id', requireRole('ADMIN'), id, admin.deleteUser);

export default router;
