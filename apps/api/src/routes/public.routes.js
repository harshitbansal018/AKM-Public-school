import { Router } from 'express';
import * as controller from '../controllers/public/public.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { honeypot } from '../middlewares/honeypot.middleware.js';
import { enquiryLimiter } from '../middlewares/rateLimit.middleware.js';
import { idParamSchema, slugParamSchema } from '../validators/common.validator.js';
import { listNoticesSchema } from '../validators/content.validator.js';
import { createEnquirySchema } from '../validators/enquiry.validator.js';

const router = Router();

// Everything the homepage needs, in one call.
router.get('/home', controller.getHome);

// Site-wide content
router.get('/settings', controller.getSettings);
router.get('/announcements', controller.getAnnouncements);
router.get('/academic-stages', controller.getStages);
router.get('/streams', controller.getStreams);
router.get('/facilities', controller.getFacilities);
router.get('/faculty', controller.getFaculty);
router.get('/faculty/principal', controller.getPrincipal);
router.get('/achievements', controller.getAchievements);

// Notices — the /:slug route is declared last so it cannot shadow the list.
router.get('/notices', validate(listNoticesSchema, 'query'), controller.getNotices);
router.get('/notices/:slug', validate(slugParamSchema, 'params'), controller.getNoticeBySlug);

// Gallery
router.get('/gallery', controller.getGallery);
router.get('/gallery/:slug', validate(slugParamSchema, 'params'), controller.getAlbumBySlug);

// Downloads
router.get('/downloads', controller.getDownloads);
router.get('/downloads/:id/file', validate(idParamSchema, 'params'), controller.downloadFile);

// The only public write: the admission enquiry form.
router.post(
  '/enquiries',
  enquiryLimiter,
  honeypot,
  validate(createEnquirySchema),
  controller.createEnquiry
);

export default router;
