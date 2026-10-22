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

const SCHOOL_NAME = 'AKM Public Sr. Sec. School';

/** User-entered form values must never become executable HTML in an email. */
function escapeHtml(value) {
  return String(value ?? '—')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

/** Fills escaped {{placeholders}} in a template file. */
function render(templateName, values) {
  const file = path.resolve(process.cwd(), 'templates', 'email', `${templateName}.html`);
  let html = fs.readFileSync(file, 'utf8');

  for (const [key, value] of Object.entries(values)) {
    html = html.replaceAll(`{{${key}}}`, escapeHtml(value));
  }

  return html;
}

/** Every message uses one centrally maintained, branded shell. */
export function renderEmail(template, values = {}) {
  const content = render(template, values);
  const layout = render('layout', {
    schoolName: SCHOOL_NAME,
    logoUrl: `${env.publicBaseUrl}/images/logo.png`,
    websiteUrl: env.publicBaseUrl,
    currentYear: new Date().getFullYear(),
  });
  const html = layout.replace('{{content}}', content);
  const unresolved = html.match(/{{[a-zA-Z0-9_]+}}/g);
  if (unresolved) {
    throw new Error(`Missing email values: ${[...new Set(unresolved)].join(', ')}`);
  }
  return html;
}

/**
 * Sends mail, or logs it when SMTP is not configured.
 *
 * Never throws: an enquiry that saved successfully must not report failure to
 * the parent just because the school's mail server is down.
 */
export async function send({ to, bcc, subject, template, values }) {
  const blindRecipients = Array.isArray(bcc) ? bcc.filter(Boolean) : bcc;
  if (!to && (!blindRecipients || blindRecipients.length === 0)) {
    return { sent: false, reason: 'no recipient configured' };
  }

  let html;
  try {
    html = renderEmail(template, values);
  } catch (error) {
    logger.error(`Email template "${template}" could not be rendered`, error.message);
    return { sent: false, reason: 'template missing' };
  }

  const mailer = getTransporter();
  const recipientLabel = to || `${blindRecipients.length} BCC recipients`;

  if (!mailer) {
    logger.info(`[mail:dry-run] to=${recipientLabel} subject="${subject}" (set SMTP_HOST to actually send)`);
    return { sent: false, reason: 'smtp not configured' };
  }

  try {
    await mailer.sendMail({ from: env.mail.from, to, bcc: blindRecipients, subject, html });
    logger.success(`Email sent to ${recipientLabel}: ${subject}`);
    return { sent: true };
  } catch (error) {
    logger.error(`Email to ${recipientLabel} failed:`, error.message);
    return { sent: false, reason: error.message };
  }
}

export default { send };
