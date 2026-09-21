import path from 'node:path';
import {
  parentRepository,
  studentRepository,
  facultyRepository,
  homeworkRepository,
  resultRepository,
  feeRecordRepository,
  facultySalaryRepository,
  jobApplicationRepository,
  policyRepository,
} from '../repositories/index.js';
import { serializeParent, serializeHomework } from '../serializers/index.js';
import { resolveClassGroup, resolvePolicyTab } from './setting.service.js';
import { prepareResult } from './result.service.js';
import { sendWelcome } from './auth.service.js';
import * as mailService from './mail.service.js';
import { env } from '../config/env.js';
import { TOKEN_KIND } from '../utils/jwt.js';
import { hashPassword } from '../utils/password.js';
import { cleanHtml } from '../utils/html.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Anything filed under a class stores the configured class label, so a student
 * entered as "10" and homework entered as "Class 10" land in the same class.
 */
export async function withResolvedClass(data) {
  if (data.classGroup === undefined) return data;
  return { ...data, classGroup: await resolveClassGroup(data.classGroup) };
}

/**
 * Results and fees belong to a registered student. Given a `studentId`, the
 * student's current name and class are copied onto the row — the parent
 * portal follows the id, and the row still reads correctly on its own.
 */
export async function withStudent(data) {
  if (!data.studentId) return withResolvedClass(data);
  const student = await studentRepository.findById(data.studentId);
  if (!student) throw ApiError.badRequest('That student is no longer in the register');
  return { ...data, studentName: student.name, classGroup: student.classGroup };
}

/** Keeps paidAmount and status telling the same story. */
async function prepareFee(input, existing) {
  const data = await withStudent(input);
  const amount = data.amount ?? Number(existing?.amount ?? 0);
  const status = data.status ?? existing?.status;
  if (status === 'PAID') data.paidAmount = amount;
  if (status === 'DUE') data.paidAmount = 0;
  const paid = data.paidAmount ?? Number(existing?.paidAmount ?? 0);
  if (paid > amount) throw ApiError.badRequest('The amount paid cannot be more than the fee amount');
  return data;
}

async function prepareStudent(input) {
  const data = await withResolvedClass(input);
  if (data.parentId && !(await parentRepository.findById(data.parentId))) {
    throw ApiError.badRequest('Choose a parent account from the list');
  }
  return data;
}

async function prepareParent({ password, ...data }) {
  return password ? { ...data, passwordHash: await hashPassword(password) } : data;
}

/** A salary month belongs to a faculty record; the name is copied from it. */
async function prepareSalary(data) {
  if (!data.facultyId) return data;
  const faculty = await facultyRepository.findById(data.facultyId);
  if (!faculty) throw ApiError.badRequest('That faculty member is no longer on record');
  return { ...data, facultyName: faculty.name };
}

/**
 * @param {object} [options]
 * @param {(data: object, existing?: object) => Promise<object>} [options.prepare]
 *        cleans a payload before create/update; on update it also gets the current row
 * @param {(row: object) => object} [options.serialize] shapes rows for the client
 */
function createInternalService(repository, label, options = {}) {
  const { prepare = async (data) => data, serialize = (row) => row } = options;
  return {
    async listAll() { return (await repository.findAll()).map(serialize); },
    async getById(id) {
      const row = await repository.findById(id);
      if (!row) throw ApiError.notFound(`${label} not found`);
      return serialize(row);
    },
    async create(data) { return serialize(await repository.create(await prepare(data))); },
    async update(id, data) {
      const existing = await repository.findById(id);
      if (!existing) throw ApiError.notFound(`${label} not found`);
      return serialize(await repository.update(id, await prepare(data, existing)));
    },
    async remove(id) {
      await this.getById(id);
      await repository.remove(id);
      return { deleted: true };
    },
  };
}

const baseParentService = createInternalService(parentRepository, 'Parent account', {
  prepare: prepareParent,
  serialize: serializeParent,
});

/** A new parent is emailed the portal address and a link to choose their password. */
export const parentService = {
  ...baseParentService,
  async create(data) {
    const parent = await baseParentService.create(data);
    sendWelcome(TOKEN_KIND.PARENT, parent, data.password);
    return parent;
  },
};
export const studentService = createInternalService(studentRepository, 'Student', { prepare: prepareStudent });
export const homeworkService = createInternalService(homeworkRepository, 'Homework', {
  prepare: withResolvedClass,
  serialize: serializeHomework,
});
export const resultService = createInternalService(resultRepository, 'Result', { prepare: prepareResult });
const rupees = (value) => Number(value ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const longDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not set';

export const feeRecordService = {
  ...createInternalService(feeRecordRepository, 'Fee record', { prepare: prepareFee }),

  /**
   * Emails the linked parent about one pending fee, with the student's total
   * outstanding across every unpaid record. Fails loudly (400) when there is
   * nobody to email — the office needs to know, not assume it went.
   */
  async sendReminder(id) {
    const fee = await feeRecordRepository.findById(id);
    if (!fee) throw ApiError.notFound('Fee record not found');
    if (fee.status === 'PAID') throw ApiError.badRequest('This fee is already paid — nothing to remind about');
    if (!fee.studentId) throw ApiError.badRequest('This fee is not linked to a registered student');

    const student = await studentRepository.findById(fee.studentId);
    if (!student?.parent) {
      throw ApiError.badRequest(`${fee.studentName} has no parent account linked — link one under Students first`);
    }
    const parent = await parentRepository.findById(student.parent.id);
    if (!parent?.email) throw ApiError.badRequest('The linked parent account has no email address');

    const pending = (await feeRecordRepository.findWhere({ studentId: student.id, status: { not: 'PAID' } }));
    const outstandingOf = (row) => Math.max(Number(row.amount) - Number(row.paidAmount), 0);
    const totalOutstanding = pending.reduce((sum, row) => sum + outstandingOf(row), 0);

    const result = await mailService.send({
      to: parent.email,
      subject: `Fee reminder for ${student.name} — ₹${rupees(outstandingOf(fee))} outstanding`,
      template: 'fee-reminder',
      values: {
        parentName: parent.name,
        studentName: student.name,
        classGroup: student.classGroup,
        feeLabel: fee.notes || `Fee due ${longDate(fee.dueDate)}`,
        amount: rupees(fee.amount),
        paid: rupees(fee.paidAmount),
        outstanding: rupees(outstandingOf(fee)),
        dueDate: longDate(fee.dueDate),
        totalOutstanding: rupees(totalOutstanding),
        pendingCount: `${pending.length} pending ${pending.length === 1 ? 'fee' : 'fees'}`,
        portalUrl: `${env.publicBaseUrl}/parent/fees?child=${student.id}`,
      },
    });

    if (!result.sent) {
      throw ApiError.badRequest(
        result.reason === 'smtp not configured'
          ? 'Email is not set up on the server yet (SMTP_HOST is blank)'
          : `The email could not be sent: ${result.reason}`
      );
    }
    return { sent: true, to: parent.email, parentName: parent.name };
  },
};
export const facultySalaryService = {
  ...createInternalService(facultySalaryRepository, 'Salary record', { prepare: prepareSalary }),

  /** The office's "paid" step: one click, dated today unless told otherwise. */
  async markPaid(id, paymentDate) {
    const row = await facultySalaryRepository.findById(id);
    if (!row) throw ApiError.notFound('Salary record not found');
    return facultySalaryRepository.update(id, {
      status: 'PAID',
      paymentDate: paymentDate ?? row.paymentDate ?? new Date(),
    });
  },

  /** A teacher's own months, newest first — scoped by the faculty id, never by name. */
  async listForFaculty(facultyId) {
    return facultySalaryRepository.findWhere({ facultyId: Number(facultyId) });
  },
};
/** AKM-2026-0042 — the year it was received, then the row id. Stable, unique, easy to quote on the phone. */
const applicationReference = (row) =>
  `AKM-${new Date(row.createdAt).getFullYear()}-${String(row.id).padStart(4, '0')}`;

export const jobApplicationService = {
  ...createInternalService(jobApplicationRepository, 'Job application'),

  /** Creates the application and stamps its reference number. */
  async create(data) {
    const row = await jobApplicationRepository.create(data);
    return jobApplicationRepository.update(row.id, { reference: applicationReference(row) });
  },

  /** Where the CV lives on disk — for the authenticated admin download. */
  async resolveResume(id) {
    const row = await jobApplicationRepository.findById(id);
    if (!row) throw ApiError.notFound('Job application not found');
    if (!row.resumePath) throw ApiError.notFound('No CV was attached to this application');
    return {
      relativePath: row.resumePath,
      filename: row.resumeName || path.basename(row.resumePath),
    };
  },
};
/** A policy is filed under one of the Policies page tabs; its content is editor HTML, cleaned here. */
async function preparePolicy(data) {
  const next = data.content === undefined ? { ...data } : { ...data, content: cleanHtml(data.content) };
  if (next.category !== undefined) next.category = await resolvePolicyTab(next.category);
  return next;
}

export const policyService = createInternalService(policyRepository, 'Policy', { prepare: preparePolicy });

export async function listPublishedHomework() {
  return (await homeworkRepository.findPublished()).map(serializeHomework);
}

/** Active policies for the website, newest effective date first. */
export async function listActivePolicies() {
  const byDate = (a, b) => new Date(b.effectiveDate ?? b.updatedAt) - new Date(a.effectiveDate ?? a.updatedAt);
  return (await policyRepository.findAll()).filter((row) => row.status === 'ACTIVE').sort(byDate);
}
