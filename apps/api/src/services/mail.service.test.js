import { describe, expect, it } from 'vitest';
import { renderEmail } from './mail.service.js';

const values = {
  name: 'Test User',
  portalName: 'Parent Portal',
  portalUrl: 'https://school.example/parent/login',
  purpose: 'View school records.',
  email: 'parent@example.com',
  resetUrl: 'https://school.example/reset?token=test',
  expiresIn: '7 days',
  reference: 'REF-0001',
  receivedAt: '22 October 2026',
  studentName: 'Student',
  phone: '9876543210',
  parentName: 'Parent',
  classGroup: 'Class 5',
  address: 'School Road',
  message: 'Please call me.',
  websiteUrl: 'https://school.example',
  feeLabel: 'October fee',
  amount: '1,000',
  paid: '0',
  outstanding: '1,000',
  dueDate: '31 October 2026',
  totalOutstanding: '1,000',
  pendingCount: '1 pending fee',
  title: 'Important notice',
  subject: 'Mathematics',
  exam: 'Term 1',
  resultDate: '22 October 2026',
  category: 'General',
  noticeDate: '22 October 2026',
  excerpt: 'Please read the notice.',
  noticeUrl: 'https://school.example/notices/test',
  facultyName: 'Teacher',
  month: 'October 2026',
  paymentDate: '22 October 2026',
  applicantName: 'Applicant',
  position: 'Teacher',
  qualification: 'B.Ed',
  experience: '2 years',
  resumeStatus: 'CV attached',
  adminUrl: 'https://school.example/admin/job-applications/1',
};

const templates = [
  'account-welcome',
  'password-reset',
  'enquiry-notify',
  'enquiry-received',
  'fee-reminder',
  'homework-published',
  'result-published',
  'notice-published',
  'salary-paid',
  'job-application-received',
  'job-application-notify',
];

describe('email templates', () => {
  it.each(templates)('renders the branded %s template completely', (template) => {
    const html = renderEmail(template, values);
    expect(html).toContain('AKM Public Sr. Sec. School');
    expect(html).toContain('/images/logo.png');
    expect(html).not.toMatch(/{{[a-zA-Z0-9_]+}}/);
  });

  it('escapes user-entered values', () => {
    const html = renderEmail('notice-published', {
      ...values,
      excerpt: '<script>alert("x")</script>',
    });
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
});
