/**
 * The single success envelope every endpoint replies with.
 *
 *   { success: true, message, data, meta? }
 *
 * The frontend's apiFetch() unwraps `data`, so keeping this uniform is what
 * lets every page consume the API without special-casing.
 */
export class ApiResponse {
  constructor(data = null, message = 'OK', meta = null) {
    this.success = true;
    this.message = message;
    this.data = data;
    if (meta) this.meta = meta;
  }
}

/** Convenience: res.ok(data, 'Notice created', 201) */
export function sendOk(res, data, message = 'OK', statusCode = 200, meta = null) {
  return res.status(statusCode).json(new ApiResponse(data, message, meta));
}

export default ApiResponse;
