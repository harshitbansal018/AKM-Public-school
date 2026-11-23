import rateLimit from 'express-rate-limit';

const message = (text) => ({ success: false, message: text });

/** Broad ceiling for the whole API — stops runaway scripts, ignores real users. */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: message('Too many requests — please slow down.'),
});

/**
 * The public enquiry form. Tight, because this endpoint writes to the database
 * and emails the school on every call, so it is the obvious spam target.
 */
export const enquiryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: message('You have already sent several enquiries — please call the school instead.'),
});

/**
 * Careers submissions have their own allowance. Sharing the enquiry limiter
 * meant five admission enquiries could lock every applicant on the same Wi-Fi
 * out of the careers form, and returned an unrelated enquiry error message.
 */
export const applicationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: message('You have already sent several applications — please wait before trying again.'),
});

/** Password-reset emails: a few per address per quarter hour is plenty. */
export const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: message('Too many reset requests — please wait 15 minutes and try again.'),
});

/** Slows down password guessing without locking out a forgetful admin. */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: message('Too many sign-in attempts — please wait 15 minutes.'),
});

export default generalLimiter;
