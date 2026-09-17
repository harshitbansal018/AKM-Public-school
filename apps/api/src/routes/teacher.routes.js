import { Router } from 'express';

import { createAuthController } from '../controllers/auth.controller.js';
import * as teacher from '../controllers/teacher/teacher.controller.js';
import { teacherHomeworkService, teacherResultService } from '../services/teacher.service.js';

import { authenticateTeacher } from '../middlewares/auth.middleware.js';
import { TOKEN_KIND } from '../utils/jwt.js';
import { validate } from '../middlewares/validate.middleware.js';
import { loginLimiter } from '../middlewares/rateLimit.middleware.js';
import { revalidateOnWrite } from '../middlewares/revalidate.middleware.js';

import { idParamSchema } from '../validators/common.validator.js';
import { loginSchema } from '../validators/auth.validator.js';
import * as schema from '../validators/content.validator.js';

const router = Router();
const id = validate(idParamSchema, 'params');

/* ---------------------------------------------------------------
   Auth — the only routes in this file that are reachable signed out.
   --------------------------------------------------------------- */
const auth = createAuthController({
  kind: TOKEN_KIND.FACULTY,
  portal: 'teacher',
  cookie: 'akm_teacher_refresh',
});
router.post('/auth/login', loginLimiter, validate(loginSchema), auth.login);
router.post('/auth/refresh', auth.refresh);
router.post('/auth/logout', auth.logout);
router.get('/auth/me', authenticateTeacher, auth.me);

/* ---------------------------------------------------------------
   Everything below requires a signed-in teacher with portal access.
   --------------------------------------------------------------- */
router.use(authenticateTeacher);

// Publishing homework or a result busts the public pages' cache, as in admin.
router.use(revalidateOnWrite);

router.get('/dashboard', teacher.getDashboard);
router.get('/students', teacher.listStudents);
router.get('/salary', teacher.listSalary);

const resources = [
  ['homework', teacherHomeworkService, 'Homework', schema.createHomeworkSchema, schema.updateHomeworkSchema],
  ['results', teacherResultService, 'Result', schema.createResultSchema, schema.updateResultSchema],
];

for (const [path, service, label, createSchema, updateSchema] of resources) {
  const c = teacher.createScopedController(service, label);
  router.get(`/${path}`, c.list);
  router.post(`/${path}`, validate(createSchema), c.create);
  router.get(`/${path}/:id`, id, c.get);
  router.put(`/${path}/:id`, id, validate(updateSchema), c.update);
  router.delete(`/${path}/:id`, id, c.remove);
}

export default router;
