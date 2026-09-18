import StatusPill from '@/components/admin/StatusPill/StatusPill';
import { formatLongDate } from '@/lib/format';

/**
 * Homework and results are managed from two places — the admin panel (any
 * class) and the teacher portal (assigned classes only) — with the same
 * columns and the same form. Defined once here so the two never drift.
 *
 * Pass `classOptions` to turn the free-text class box into a dropdown, and
 * `studentOptions(classGroup)` to pick a registered student instead of typing
 * a name.
 */

const dateColumn = (key, label) => ({
  key,
  label,
  nowrap: true,
  render: (row) => (row[key] ? formatLongDate(row[key]) : '—'),
});

const publishedColumn = {
  key: 'isPublished',
  label: 'Status',
  width: '110px',
  render: (row) => (
    <StatusPill
      value={row.isPublished ? 'published' : 'draft'}
      label={row.isPublished ? 'Published' : 'Draft'}
    />
  ),
};

const classField = (classOptions) =>
  classOptions
    ? {
        name: 'classGroup',
        label: 'Class / section',
        type: 'select',
        options: classOptions,
        placeholder: 'Choose a class…',
        required: true,
        half: true,
      }
    : { name: 'classGroup', label: 'Class / section', type: 'text', required: true, half: true, placeholder: 'Class 5' };

// ---------- homework ----------

export const homeworkColumns = [
  { key: 'title', label: 'Assignment' },
  { key: 'classGroup', label: 'Class' },
  { key: 'subject', label: 'Subject' },
  dateColumn('dueDate', 'Due date'),
  publishedColumn,
];

/**
 * @param {object} options
 * @param {boolean} [options.publishControl]  false in the teacher portal, where
 *        homework goes live the moment it is saved — no draft step to forget.
 */
export function homeworkFields({ classOptions, subjectOptions, publishControl = true } = {}) {
  return [
    { name: 'title', label: 'Assignment title', type: 'text', required: true },
    classField(classOptions),
    subjectField(subjectOptions, { required: true }),
    { name: 'dueDate', label: 'Due date', type: 'date', half: true },
    { name: 'description', label: 'Instructions', type: 'textarea', rows: 5 },
    ...(publishControl
      ? [
          {
            name: 'isPublished',
            label: 'Publish — show on the website',
            type: 'checkbox',
            help: 'Unpublished homework is a draft only the office can see.',
          },
        ]
      : []),
  ];
}

/** The homework table without the Published/Draft column (teacher portal). */
export const teacherHomeworkColumns = homeworkColumns.filter((column) => column.key !== 'isPublished');

/**
 * Subject dropdown from the configured list (Website content → Classes &
 * subjects); a value saved under a name no longer on the list is still shown.
 */
function subjectField(subjectOptions, { required = false } = {}) {
  if (!subjectOptions) return { name: 'subject', label: 'Subject', type: 'text', required, half: true };
  return {
    name: 'subject',
    label: 'Subject',
    type: 'select',
    required,
    half: true,
    placeholder: 'Choose a subject…',
    options: (values) =>
      values.subject && !subjectOptions.some((option) => option.value === values.subject)
        ? [{ value: values.subject, label: values.subject }, ...subjectOptions]
        : subjectOptions,
  };
}

// ---------- results ----------

/** "87 / 100" from the numbers, or whatever text was saved for an older row. */
export const scoreText = (row) =>
  row.marks !== null && row.marks !== undefined
    ? `${Number(row.marks)}${row.maxMarks !== null && row.maxMarks !== undefined ? ` / ${Number(row.maxMarks)}` : ''}`
    : row.score;

/**
 * Turns the student register into a per-class picker. The value is the
 * student's id — results and fees are linked to the student record, which is
 * what lets the parent portal show a parent exactly their own child's rows.
 */
export const studentOptionsFrom = (students) => (classGroup) =>
  students
    .filter((student) => student.classGroup === classGroup)
    .map((student) => ({
      value: student.id,
      label: student.rollNumber ? `${student.name} (Roll ${student.rollNumber})` : student.name,
    }));

/** Class dropdown + dependent student dropdown, shared by results and fees. */
export function studentFields({ classOptions, studentOptions }) {
  return [
    classField(classOptions),
    {
      name: 'studentId',
      label: 'Student',
      type: 'select',
      options: (values) => studentOptions(values.classGroup),
      placeholder: 'Choose a student…',
      required: true,
      half: true,
      help: 'Pick the class first. Students are registered by the school office under Students.',
    },
  ];
}

export const resultColumns = [
  { key: 'studentName', label: 'Student' },
  { key: 'classGroup', label: 'Class' },
  { key: 'exam', label: 'Examination' },
  { key: 'subject', label: 'Subject', render: (row) => row.subject ?? '—' },
  { key: 'score', label: 'Marks', nowrap: true, render: (row) => <b>{scoreText(row)}</b> },
  dateColumn('resultDate', 'Date'),
  publishedColumn,
];

export function resultFields({ classOptions, studentOptions, subjectOptions }) {
  return [
    ...studentFields({ classOptions, studentOptions }),
    { name: 'exam', label: 'Examination', type: 'text', required: true, half: true, placeholder: 'Half-yearly 2026' },
    subjectField(subjectOptions),
    { name: 'marks', label: 'Marks obtained', type: 'number', half: true, min: 0, step: '0.5', placeholder: '87' },
    { name: 'maxMarks', label: 'Maximum marks', type: 'number', half: true, min: 0, step: '0.5', placeholder: '100' },
    {
      name: 'score',
      label: 'Grade (if there are no marks)',
      type: 'text',
      half: true,
      placeholder: 'A+',
      help: 'Filled in automatically as “marks / maximum” when marks are entered.',
    },
    { name: 'resultDate', label: 'Result date', type: 'date', half: true },
    { name: 'remarks', label: 'Remarks', type: 'textarea', rows: 3 },
    {
      name: 'isPublished',
      label: 'Publish — release to the parent',
      type: 'checkbox',
      help: 'Results are never shown on the public website. Once published, only the linked parent can see this result on the parent portal; until then it is a draft.',
    },
  ];
}
