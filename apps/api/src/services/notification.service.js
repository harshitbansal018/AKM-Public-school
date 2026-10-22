import { facultyRepository, parentRepository, studentRepository } from '../repositories/index.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import * as mailService from './mail.service.js';

const uniqueEmails = (values) => [
  ...new Set(
    values
      .map((value) => String(value ?? '').trim().toLowerCase())
      .filter(Boolean)
  ),
];

const longDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Not announced';
const rupees = (value) =>
  Number(value ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

async function parentEmailsForClass(classGroup) {
  const students = await studentRepository.findWhere({ classGroup });
  return uniqueEmails(students.map((student) => student.parent?.email));
}

async function broadcast({ recipients, subject, template, values }) {
  if (!recipients.length) {
    logger.info(`[mail] ${template} skipped: no eligible recipients`);
    return { sent: false, reason: 'no eligible recipients' };
  }
  return mailService.send({ bcc: recipients, subject, template, values });
}

async function safely(label, task) {
  try {
    return await task();
  } catch (error) {
    logger.error(`${label} email failed (the saved record was kept):`, error.message);
    return { sent: false, reason: error.message };
  }
}

/** One private BCC mail to the parents linked with students in this class. */
export async function homeworkPublished(homework) {
  return safely('Homework notification', async () => {
    const recipients = await parentEmailsForClass(homework.classGroup);
    return broadcast({
      recipients,
      subject: `New homework: ${homework.subject} - ${homework.classGroup}`,
      template: 'homework-published',
      values: {
        title: homework.title,
        subject: homework.subject,
        classGroup: homework.classGroup,
        dueDate: longDate(homework.dueDate),
        portalUrl: `${env.publicBaseUrl}/parent/homework`,
      },
    });
  });
}

/** Sent once when a draft marks sheet becomes published. */
export async function resultsPublished({ classGroup, exam, resultDate }) {
  return safely('Result notification', async () => {
    const recipients = await parentEmailsForClass(classGroup);
    return broadcast({
      recipients,
      subject: `${exam} results published - ${classGroup}`,
      template: 'result-published',
      values: {
        classGroup,
        exam,
        resultDate: longDate(resultDate),
        portalUrl: `${env.publicBaseUrl}/parent/results`,
      },
    });
  });
}

/** A single-result correction/addition only alerts that student's parent. */
export async function resultPublishedForStudent(result) {
  return safely('Result notification', async () => {
    if (!result.studentId) return { sent: false, reason: 'no linked student' };
    const student = await studentRepository.findById(result.studentId);
    if (!student?.parent?.email) return { sent: false, reason: 'no linked parent email' };
    return mailService.send({
      to: student.parent.email,
      subject: `${result.exam} result published - ${student.name}`,
      template: 'result-published',
      values: {
        classGroup: result.classGroup,
        exam: result.exam,
        resultDate: longDate(result.resultDate),
        portalUrl: `${env.publicBaseUrl}/parent/results`,
      },
    });
  });
}

export async function salaryPaid(salary) {
  return safely('Salary notification', async () => {
    if (!salary.facultyId) return { sent: false, reason: 'no linked faculty member' };
    const faculty = await facultyRepository.findById(salary.facultyId);
    if (!faculty?.accountEmail) return { sent: false, reason: 'no teacher account email' };
    return mailService.send({
      to: faculty.accountEmail,
      subject: `Salary payment recorded - ${salary.month}`,
      template: 'salary-paid',
      values: {
        facultyName: salary.facultyName,
        month: salary.month,
        amount: rupees(salary.amount),
        paymentDate: longDate(salary.paymentDate),
        portalUrl: `${env.publicBaseUrl}/teacher/salary`,
      },
    });
  });
}

/** Public notices go to active parent accounts and enabled teacher accounts. */
export async function noticePublished(notice) {
  return safely('Notice notification', async () => {
    const [parents, faculty] = await Promise.all([
      parentRepository.findWhere({ isActive: true }),
      facultyRepository.findWhere({ teacherAccess: true, accountEmail: { not: null } }),
    ]);
    const recipients = uniqueEmails([
      ...parents.map((parent) => parent.email),
      ...faculty.map((member) => member.accountEmail),
    ]);
    return broadcast({
      recipients,
      subject: `School notice: ${notice.title}`,
      template: 'notice-published',
      values: {
        title: notice.title,
        category: notice.category,
        noticeDate: longDate(notice.noticeDate),
        excerpt: notice.excerpt || 'Please open the notice to read the complete information.',
        noticeUrl: `${env.publicBaseUrl}/notices/${notice.slug}`,
      },
    });
  });
}

export default {
  homeworkPublished,
  resultsPublished,
  resultPublishedForStudent,
  salaryPaid,
  noticePublished,
};
