/**
 * Reports / Print: the office's exports.
 *
 * Every report is defined once here — where its rows come from, which filters
 * apply, and its columns. The same definition serves the CSV download (Excel)
 * and the print-friendly page, so the two can never disagree.
 */
import {
  parentRepository,
  studentRepository,
  facultyRepository,
  homeworkRepository,
  resultRepository,
  feeRecordRepository,
  facultySalaryRepository,
  jobApplicationRepository,
  enquiryRepository,
} from '../repositories/index.js';
import { facultyClasses } from '../serializers/index.js';
import { CLASS_LABELS } from './enquiry.service.js';
import { toCsv } from '../utils/csv.js';
import { ApiError } from '../utils/ApiError.js';

const date = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '');
const money = (value) => (value === null || value === undefined ? '' : Number(value).toFixed(2));
const yesNo = (value) => (value ? 'Yes' : 'No');

/**
 * @typedef Report
 * @property {string}   label
 * @property {string}   description
 * @property {string[]} filters   any of 'classGroup' | 'status' | 'dates'
 * @property {string[]} [statuses] choices for the status filter
 * @property {string}   [dateField] which date the range applies to (default createdAt)
 * @property {(where: object) => Promise<object[]>} rows
 * @property {(where: object) => Promise<number>} count
 * @property {{key: string, label: string, value: (row: object) => any}[]} columns
 */
const REPORTS = {
  students: {
    label: 'Students',
    description: 'The student register with class, guardian and linked parent login.',
    filters: ['classGroup', 'dates'],
    rows: (where) => studentRepository.findWhere(where),
    count: (where) => studentRepository.count(where),
    columns: [
      { key: 'id', label: 'ID', value: (r) => r.id },
      { key: 'name', label: 'Student', value: (r) => r.name },
      { key: 'classGroup', label: 'Class', value: (r) => r.classGroup },
      { key: 'rollNumber', label: 'Roll no.', value: (r) => r.rollNumber },
      { key: 'guardianName', label: 'Parent / guardian', value: (r) => r.guardianName },
      { key: 'phone', label: 'Phone', value: (r) => r.phone },
      { key: 'address', label: 'Address', value: (r) => r.address },
      { key: 'parent', label: 'Parent login', value: (r) => r.parent?.email },
      { key: 'createdAt', label: 'Registered', value: (r) => date(r.createdAt) },
    ],
  },

  parents: {
    label: 'Parents',
    description: 'Parent-portal accounts and how many children each is linked to.',
    filters: ['dates'],
    rows: (where) => parentRepository.findWhere(where),
    count: (where) => parentRepository.count(where),
    columns: [
      { key: 'name', label: 'Parent', value: (r) => r.name },
      { key: 'email', label: 'Login email', value: (r) => r.email },
      { key: 'phone', label: 'Phone', value: (r) => r.phone },
      { key: 'children', label: 'Children linked', value: (r) => r._count?.children ?? 0 },
      { key: 'isActive', label: 'Active', value: (r) => yesNo(r.isActive) },
      { key: 'lastLoginAt', label: 'Last signed in', value: (r) => date(r.lastLoginAt) },
      { key: 'createdAt', label: 'Created', value: (r) => date(r.createdAt) },
    ],
  },

  teachers: {
    label: 'Teachers / Faculty',
    description: 'Staff records, portal access and assigned classes.',
    filters: ['dates'],
    rows: (where) => facultyRepository.findWhere(where),
    count: (where) => facultyRepository.count(where),
    columns: [
      { key: 'name', label: 'Name', value: (r) => r.name },
      { key: 'designation', label: 'Designation', value: (r) => r.designation },
      { key: 'subject', label: 'Subject', value: (r) => r.subject },
      { key: 'qualification', label: 'Qualification', value: (r) => r.qualification },
      { key: 'accountEmail', label: 'Login email', value: (r) => r.accountEmail },
      { key: 'teacherAccess', label: 'Portal access', value: (r) => yesNo(r.teacherAccess) },
      { key: 'assignedClasses', label: 'Assigned classes', value: (r) => facultyClasses(r).join(', ') },
      { key: 'isPublished', label: 'On website', value: (r) => yesNo(r.isPublished) },
    ],
  },

  homework: {
    label: 'Homework',
    description: 'Homework set per class, with due dates and publish state.',
    filters: ['classGroup', 'status', 'dates'],
    statuses: ['PUBLISHED', 'DRAFT'],
    dateField: 'dueDate',
    rows: (where) => homeworkRepository.findWhere(where),
    count: (where) => homeworkRepository.count(where),
    columns: [
      { key: 'classGroup', label: 'Class', value: (r) => r.classGroup },
      { key: 'subject', label: 'Subject', value: (r) => r.subject },
      { key: 'title', label: 'Assignment', value: (r) => r.title },
      { key: 'dueDate', label: 'Due date', value: (r) => date(r.dueDate) },
      { key: 'isPublished', label: 'Published', value: (r) => yesNo(r.isPublished) },
      { key: 'createdAt', label: 'Set on', value: (r) => date(r.createdAt) },
    ],
  },

  results: {
    label: 'Results',
    description: 'Test and examination results per student.',
    filters: ['classGroup', 'status', 'dates'],
    statuses: ['PUBLISHED', 'DRAFT'],
    dateField: 'resultDate',
    rows: (where) => resultRepository.findWhere(where),
    count: (where) => resultRepository.count(where),
    columns: [
      { key: 'studentName', label: 'Student', value: (r) => r.studentName },
      { key: 'classGroup', label: 'Class', value: (r) => r.classGroup },
      { key: 'exam', label: 'Examination', value: (r) => r.exam },
      { key: 'subject', label: 'Subject', value: (r) => r.subject },
      { key: 'marks', label: 'Marks', value: (r) => (r.marks === null ? '' : Number(r.marks)) },
      { key: 'maxMarks', label: 'Max marks', value: (r) => (r.maxMarks === null ? '' : Number(r.maxMarks)) },
      { key: 'score', label: 'Score', value: (r) => r.score },
      { key: 'resultDate', label: 'Date', value: (r) => date(r.resultDate) },
      { key: 'isPublished', label: 'Published', value: (r) => yesNo(r.isPublished) },
      { key: 'remarks', label: 'Remarks', value: (r) => r.remarks },
    ],
  },

  fees: {
    label: 'Fees',
    description: 'Fee records per student: amount, paid, outstanding and status.',
    filters: ['classGroup', 'status', 'dates'],
    statuses: ['DUE', 'PARTIAL', 'PAID'],
    dateField: 'dueDate',
    rows: (where) => feeRecordRepository.findWhere(where),
    count: (where) => feeRecordRepository.count(where),
    columns: [
      { key: 'studentName', label: 'Student', value: (r) => r.studentName },
      { key: 'classGroup', label: 'Class', value: (r) => r.classGroup },
      { key: 'amount', label: 'Amount', value: (r) => money(r.amount) },
      { key: 'paidAmount', label: 'Paid', value: (r) => money(r.paidAmount) },
      { key: 'outstanding', label: 'Outstanding', value: (r) => money(Math.max(Number(r.amount) - Number(r.paidAmount), 0)) },
      { key: 'dueDate', label: 'Due date', value: (r) => date(r.dueDate) },
      { key: 'status', label: 'Status', value: (r) => r.status },
      { key: 'notes', label: 'Notes', value: (r) => r.notes },
    ],
  },

  salaries: {
    label: 'Faculty Salary',
    description: 'Salary months per teacher and their payment status.',
    filters: ['status', 'dates'],
    statuses: ['DUE', 'PAID'],
    dateField: 'paymentDate',
    rows: (where) => facultySalaryRepository.findWhere(where),
    count: (where) => facultySalaryRepository.count(where),
    columns: [
      { key: 'facultyName', label: 'Faculty member', value: (r) => r.facultyName },
      { key: 'month', label: 'Month', value: (r) => r.month },
      { key: 'amount', label: 'Amount', value: (r) => money(r.amount) },
      { key: 'status', label: 'Status', value: (r) => r.status },
      { key: 'paymentDate', label: 'Paid on', value: (r) => date(r.paymentDate) },
      { key: 'notes', label: 'Notes', value: (r) => r.notes },
    ],
  },

  applications: {
    label: 'Job Applications',
    description: 'Applications from the Careers page and where each stands.',
    filters: ['status', 'dates'],
    statuses: ['NEW', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED'],
    rows: (where) => jobApplicationRepository.findWhere(where),
    count: (where) => jobApplicationRepository.count(where),
    columns: [
      { key: 'reference', label: 'Reference', value: (r) => r.reference },
      { key: 'name', label: 'Applicant', value: (r) => r.name },
      { key: 'position', label: 'Position', value: (r) => r.position },
      { key: 'subject', label: 'Subject', value: (r) => r.subject },
      { key: 'qualification', label: 'Qualification', value: (r) => r.qualification },
      { key: 'experience', label: 'Experience', value: (r) => r.experience },
      { key: 'phone', label: 'Phone', value: (r) => r.phone },
      { key: 'email', label: 'Email', value: (r) => r.email },
      { key: 'status', label: 'Status', value: (r) => r.status },
      { key: 'createdAt', label: 'Received', value: (r) => date(r.createdAt) },
    ],
  },

  enquiries: {
    label: 'Admission Enquiries',
    description: 'Enquiries sent from the website, in the order they arrived.',
    filters: ['status', 'dates'],
    statuses: ['NEW', 'CONTACTED', 'ADMITTED', 'CLOSED'],
    rows: async (where) => {
      const rows = await enquiryRepository.findAllForExport();
      return rows.filter((row) => matches(row, where));
    },
    count: async (where) => (await enquiryRepository.findAllForExport()).filter((row) => matches(row, where)).length,
    columns: [
      { key: 'reference', label: 'Reference', value: (r) => `ENQ-${String(r.id).padStart(5, '0')}` },
      { key: 'createdAt', label: 'Received', value: (r) => date(r.createdAt) },
      { key: 'studentName', label: 'Student', value: (r) => r.studentName },
      { key: 'parentName', label: 'Parent', value: (r) => r.parentName },
      { key: 'phone', label: 'Phone', value: (r) => r.phone },
      { key: 'email', label: 'Email', value: (r) => r.email },
      { key: 'classGroup', label: 'Class', value: (r) => CLASS_LABELS[r.classGroup] ?? r.classGroup },
      { key: 'address', label: 'Address', value: (r) => r.address },
      { key: 'message', label: 'Message', value: (r) => r.message },
      { key: 'status', label: 'Status', value: (r) => r.status },
      { key: 'adminNote', label: 'Admin note', value: (r) => r.adminNote },
    ],
  },
};

/** In-memory equivalent of the Prisma `where` we build, for the one non-Prisma-shaped source. */
function matches(row, where) {
  for (const [field, condition] of Object.entries(where)) {
    const value = row[field];
    if (condition && typeof condition === 'object' && !(condition instanceof Date)) {
      if (condition.gte && !(new Date(value) >= condition.gte)) return false;
      if (condition.lte && !(new Date(value) <= condition.lte)) return false;
    } else if (value !== condition) {
      return false;
    }
  }
  return true;
}

/** Turns the query string into a Prisma `where` for one report. */
function buildWhere(report, query = {}) {
  const where = {};

  if (report.filters.includes('classGroup') && query.classGroup) where.classGroup = query.classGroup;

  if (report.filters.includes('status') && query.status) {
    if (report.statuses.includes('PUBLISHED')) where.isPublished = query.status === 'PUBLISHED';
    else where.status = query.status;
  }

  if (report.filters.includes('dates') && (query.from || query.to)) {
    const field = report.dateField ?? 'createdAt';
    where[field] = {};
    if (query.from) where[field].gte = new Date(query.from);
    if (query.to) {
      const to = new Date(query.to);
      to.setHours(23, 59, 59, 999);
      where[field].lte = to;
    }
  }

  return where;
}

/** The report catalogue with a live row count each — the Reports page. */
export async function listReports() {
  return Promise.all(
    Object.entries(REPORTS).map(async ([key, report]) => ({
      key,
      label: report.label,
      description: report.description,
      filters: report.filters,
      statuses: report.statuses ?? [],
      dateField: report.dateField ?? 'createdAt',
      count: await report.count({}),
    }))
  );
}

/** One report's rows, shaped for the print page ({ columns, rows }) or as CSV text. */
export async function runReport(key, query = {}) {
  const report = REPORTS[key];
  if (!report) throw ApiError.notFound('Unknown report');

  const where = buildWhere(report, query);
  const rows = await report.rows(where);
  const columns = report.columns.map(({ key: columnKey, label }) => ({ key: columnKey, label }));
  const table = rows.map((row) =>
    Object.fromEntries(report.columns.map((column) => [column.key, column.value(row) ?? '']))
  );

  return {
    key,
    label: report.label,
    generatedAt: new Date(),
    filters: query,
    columns,
    rows: table,
    csv: () => toCsv(columns, table.map((row) => columns.map((column) => row[column.key]))),
  };
}

export const reportKeys = Object.keys(REPORTS);
