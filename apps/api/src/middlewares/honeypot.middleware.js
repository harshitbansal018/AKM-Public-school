import { logger } from '../utils/logger.js';

/**
 * The enquiry form carries a hidden `website` field. People never see it, so
 * they never fill it; bots fill every input they find.
 *
 * A filled honeypot gets a 200 with no record written — a bot told it failed
 * simply retries, so we let it think it succeeded.
 */
export function honeypot(req, res, next) {
  if (req.body?.website) {
    logger.warn(`Honeypot triggered from ${req.ip} — enquiry discarded`);
    return res.status(200).json({
      success: true,
      message: 'Thank you! The school will contact you shortly.',
      data: null,
    });
  }

  delete req.body.website;
  return next();
}

export default honeypot;
