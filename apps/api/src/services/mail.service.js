import fs from 'node:fs';
import path from 'node:path';
import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

let transporter = null;

function getTransporter() {
  if (!env.mail.enabled) return null;
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: env.mail.host,
    port: env.mail.port,
    secure: env.mail.port === 465,
    auth: env.mail.user ? { user: env.mail.user, pass: env.mail.pass } : undefined,
  });

  return transporter;
}

/** Fills {{placeholders}} in a template file. */
function render(templateName, values) {
  const file = path.resolve(process.cwd(), 'templates', 'email', `${templateName}.html`);
  let html = fs.readFileSync(file, 'utf8');

  for (const [key, value] of Object.entries(values)) {
    html = html.replaceAll(`{{${key}}}`, String(value ?? '—'));
  }

  return html;
}

/**
 * Sends mail, or logs it when SMTP is not configured.
 *
 * Never throws: an enquiry that saved successfully must not report failure to
 * the parent just because the school's mail server is down.
 */
export async function send({ to, subject, template, values }) {
  if (!to) return { sent: false, reason: 'no recipient configured' };

  let html;
  try {
    html = render(template, values);
  } catch (error) {
    logger.error(`Email template "${template}" could not be read`, error.message);
    return { sent: false, reason: 'template missing' };
  }

  const mailer = getTransporter();

  if (!mailer) {
    logger.info(`[mail:dry-run] to=${to} subject="${subject}" (set SMTP_HOST to actually send)`);
    return { sent: false, reason: 'smtp not configured' };
  }

  try {
    await mailer.sendMail({ from: env.mail.from, to, subject, html });
    logger.success(`Email sent to ${to}: ${subject}`);
    return { sent: true };
  } catch (error) {
    logger.error(`Email to ${to} failed:`, error.message);
    return { sent: false, reason: error.message };
  }
}

export default { send };
