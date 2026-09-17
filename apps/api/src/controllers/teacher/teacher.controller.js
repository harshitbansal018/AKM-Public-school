import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendOk } from '../../utils/ApiResponse.js';
import * as teacherService from '../../services/teacher.service.js';
import { facultySalaryService } from '../../services/internalRecords.service.js';

export const getDashboard = asyncHandler(async (req, res) => {
  sendOk(res, await teacherService.getDashboard(req.user), 'Teacher dashboard');
});

export const listStudents = asyncHandler(async (req, res) => {
  sendOk(res, await teacherService.listStudents(req.user), 'Students');
});

/** Only the signed-in teacher's own salary months. */
export const listSalary = asyncHandler(async (req, res) => {
  sendOk(res, await facultySalaryService.listForFaculty(req.user.id), 'Salary');
});

/**
 * Same five handlers as the admin CRUD controller, except every call carries
 * the signed-in teacher so the service can enforce their class scope.
 */
export function createScopedController(service, label) {
  return {
    list: asyncHandler(async (req, res) => {
      sendOk(res, await service.list(req.user), `${label} list`);
    }),

    get: asyncHandler(async (req, res) => {
      sendOk(res, await service.getById(req.user, req.params.id), label);
    }),

    create: asyncHandler(async (req, res) => {
      sendOk(res, await service.create(req.user, req.body), `${label} created`, 201);
    }),

    update: asyncHandler(async (req, res) => {
      sendOk(res, await service.update(req.user, req.params.id, req.body), `${label} updated`);
    }),

    remove: asyncHandler(async (req, res) => {
      sendOk(res, await service.remove(req.user, req.params.id), `${label} deleted`);
    }),
  };
}
