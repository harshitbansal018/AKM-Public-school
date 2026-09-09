/**
 * Upload rules, kept in one place so the file picker, the client-side check and
 * every hint the user reads can never drift apart.
 *
 * These mirror apps/api/src/config/multer.js and MAX_IMAGE_MB in the API's
 * .env — the API is what actually enforces them. Anything here is a courtesy
 * to save a doomed upload, not a security control.
 */ 

export const IMAGE_TYPES = ['image/jpeg', 'image/png'];

/** For the file picker's `accept` attribute. */
export const IMAGE_ACCEPT = '.jpg,.jpeg,.png,image/jpeg,image/png';

export const MAX_IMAGE_MB = 2;
export const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024;

/** Reused in help text across the admin screens. */
export const IMAGE_RULE = `JPG or PNG · up to ${MAX_IMAGE_MB} MB`;

// ---- documents (downloads section) ----

export const DOCUMENT_ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png';
export const MAX_DOCUMENT_MB = 20;
export const DOCUMENT_RULE = `PDF, Word, Excel, JPG or PNG · up to ${MAX_DOCUMENT_MB} MB`;
