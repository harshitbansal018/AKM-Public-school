import { Router } from 'express';

import { createAuthController } from '../controllers/auth.controller.js';
import * as parentService from '../services/parent.service.js';

import { authenticateParent } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { loginLimiter } from '../middlewares/rateLimit.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOk } from '../utils/ApiResponse.js';
import { TOKEN_KIND } from '../utils/jwt.js';

import { idParamSchema } from '../validators/common.validator.js';
import { loginSchema } from '../validators/auth.validator.js';

const router = Router();
const id = validate(idParamSchema, 'params');

/* ---------------------------------------------------------------
   Auth — the only routes in this file that are reachable signed out.
   --------------------------------------------------------------- */
const auth = createAuthController({
  kind: TOKEN_KIND.PARENT,
  portal: 'parent',
  cookie: 'akm_parent_refresh',
});
router.post('/auth/login', loginLimiter, validate(loginSchema), auth.login);
router.post('/auth/refresh', auth.refresh);
router.post('/auth/logout', auth.logout);
router.get('/auth/me', authenticateParent, auth.me);

/* ---------------------------------------------------------------
   Everything below is read-only and scoped to the parent's own children.
   --------------------------------------------------------------- */
router.use(authenticateParent);

router.get(
  '/children',
  asyncHandler(async (req, res) => sendOk(res, await parentService.listChildren(req.user), 'Children'))
);

router.get(
  '/children/:id',
  id,
  asyncHandler(async (req, res) =>
    sendOk(res, await parentService.getChildDetail(req.user, req.params.id), 'Child')
  )
);

export default router;
