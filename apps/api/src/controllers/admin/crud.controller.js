import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendOk } from '../../utils/ApiResponse.js';

/**
 * Builds the five standard CRUD handlers for a resource whose service exposes
 * listAll / getById / create / update / remove / reorder.
 *
 * Used by facilities, streams, stages, faculty and achievements — five
 * resources whose controllers would otherwise be identical.
 *
 * @param {object} service
 * @param {string} label  used in response messages, e.g. 'Facility'
 */
export function createCrudController(service, label) {
  return {
    list: asyncHandler(async (_req, res) => {
      sendOk(res, await service.listAll(), `${label} list`);
    }),

    get: asyncHandler(async (req, res) => {
      sendOk(res, await service.getById(req.params.id), label);
    }),

    create: asyncHandler(async (req, res) => {
      sendOk(res, await service.create(req.body), `${label} created`, 201);
    }),

    update: asyncHandler(async (req, res) => {
      sendOk(res, await service.update(req.params.id, req.body), `${label} updated`);
    }),

    remove: asyncHandler(async (req, res) => {
      sendOk(res, await service.remove(req.params.id), `${label} deleted`);
    }),

    reorder: asyncHandler(async (req, res) => {
      sendOk(res, await service.reorder(req.body.ids), `${label} order saved`);
    }),
  };
}

export default createCrudController;
