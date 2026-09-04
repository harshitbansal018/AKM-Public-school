import { imageUploader, documentUploader } from '../config/multer.js';

/** Single image, e.g. a faculty photo or album cover. */
export const uploadImage = (folder, field = 'file') => imageUploader(folder).single(field);

/** Many images at once, e.g. filling a gallery album. */
export const uploadImages = (folder, field = 'files', max = 20) =>
  imageUploader(folder).array(field, max);

/** A PDF or document for the downloads section. */
export const uploadDocument = (folder = 'downloads', field = 'file') =>
  documentUploader(folder).single(field);

export default uploadImage;
