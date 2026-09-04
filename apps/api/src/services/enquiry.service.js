import { enquiryRepository } from '../repositories/index.js';
import { toSkipTake, buildMeta } from '../utils/pagination.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';
import * as mailService from './mail.service.js';

const CLASS_LABELS = {
  NURSERY_UKG: 'Nursery – UKG',
  CLASS_1_5: 'Class 1 – 5',
  CLASS_6_8: 'Class 6 – 8',
  CLASS_9_10: 'Class 9 – 10',
  CLASS_11_12: 'Class 11 – 12',
};

/**
 * Records a public enquiry and notifies the school.
 *
 * The email is sent after the row is committed and its failure is swallowed —
 * losing an enquiry because SMTP hiccuped would be far worse than a missed
 * notification, and the record is still in the admin panel either way.
 */
export async function submit(input, request = {}) {
  const recent = await enquiryRepository.countRecentFromPhone(input.phone, 10);
  if (recent >= 3) {
    throw ApiError.tooMany(
      'We already have your enquiry — the school will call you shortly.'
    );
  }

  const enquiry = await enquiryRepository.create({
    ...input,
    ipAddress: request.ip ?? null,
    userAgent: request.userAgent?.slice(0, 500) ?? null,
  });

  notifySchool(enquiry).catch((error) =>
    logger.error('Enquiry notification failed (the enquiry itself was saved):', error.message)
  );

  // The parent gets a confirmation, not the stored row — no ids or IPs echoed back.
  return { received: true, reference: `ENQ-${String(enquiry.id).padStart(5, '0')}` };
}

async function notifySchool(enquiry) {
  await mailService.send({
    to: env.mail.notifyTo,
    subject: `New admission enquiry — ${enquiry.parentName}`,
    template: 'enquiry-notify',
    values: {
      parentName: enquiry.parentName,
      phone: enquiry.phone,
      email: enquiry.email,
      studentName: enquiry.studentName,
      classGroup: CLASS_LABELS[enquiry.classGroup] ?? enquiry.classGroup,
      message: enquiry.message,
      receivedAt: enquiry.createdAt.toLocaleString('en-IN'),
    },
  });
}

// ---------- admin ----------

export async function list(query = {}) {
  const { page, limit, skip, take } = toSkipTake(query);
  const { items, total } = await enquiryRepository.findPaged({
    skip,
    take,
    status: query.status,
    search: query.q,
  });

  return { items, meta: buildMeta({ page, limit, total }) };
}

export async function getById(id) {
  const enquiry = await enquiryRepository.findById(id);
  if (!enquiry) throw ApiError.notFound('Enquiry not found');
  return enquiry;
}

export async function updateStatus(id, data) {
  await getById(id);
  return enquiryRepository.update(id, data);
}

export async function remove(id) {
  await getById(id);
  await enquiryRepository.remove(id);
  return { deleted: true };
}

/** Builds a CSV the office can open in Excel. */
export async function toCsv() {
  const rows = await enquiryRepository.findAllForExport();

  const header = [
    'Reference',
    'Received',
    'Parent Name',
    'Phone',
    'Email',
    'Student Name',
    'Class',
    'Message',
    'Status',
    'Admin Note',
  ];

  // A leading =, +, - or @ makes Excel treat a cell as a formula, so those are
  // prefixed with a quote. Quotes are doubled per RFC 4180.
  const escape = (value) => {
    if (value === null || value === undefined) return '';
    let text = String(value);
    if (/^[=+\-@]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  };

  const lines = [
    header.join(','),
    ...rows.map((row) =>
      [
        `ENQ-${String(row.id).padStart(5, '0')}`,
        row.createdAt.toISOString(),
        row.parentName,
        row.phone,
        row.email,
        row.studentName,
        CLASS_LABELS[row.classGroup] ?? row.classGroup,
        row.message,
        row.status,
        row.adminNote,
      ]
        .map(escape)
        .join(',')
    ),
  ];

  return lines.join('\r\n');
}
