import { imageUploader, documentUploader } from '../config/multer.js';
import { UPLOAD_FOLDERS } from '../config/constants.js';

/**
 * Single image, saved into the folder named in the URL (/uploads/faculty).
 *
 * The uploader has to be built per request because the destination is only
 * known once `req.params` exists. It also records the folder it actually used
 * on `req.uploadFolder`, so the controller reports the real path rather than
 * assuming the request's folder was accepted.
 */
export const uploadImageToParamFolder = (field = 'file') => (req, res, next) => {
  const requested = req.params.folder;
  const folder = UPLOAD_FOLDERS.includes(requested) ? requested : 'misc';
  req.uploadFolder = folder;
  return imageUploader(folder).single(field)(req, res, next);
};

/** Single image, e.g. a faculty photo or album cover. */
export const uploadImage = (folder, field = 'file') => imageUploader(folder).single(field);

/** Many images at once, e.g. filling a gallery album. */
export const uploadImages = (folder, field = 'files', max = 20) =>
  imageUploader(folder).array(field, max);

/** A PDF or document for the downloads section. */
export const uploadDocument = (folder = 'downloads', field = 'file') =>
  documentUploader(folder).single(field);

export default uploadImage;
