/**
 * Wraps an async route handler so a rejected promise reaches Express's error
 * middleware instead of hanging the request.
 *
 * Express 4 does not catch async throws on its own — without this, a failing
 * `await` in a controller leaves the client waiting until timeout.
 */
export const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

export default asyncHandler;
