'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/adminApi';
import { formatDateTime } from '@/lib/format';
import { cn } from '@/lib/cn';
import { Loader } from '@/components/ui/Spinner/Spinner';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import Modal from '@/components/ui/Modal/Modal';
import LineIcon from '@/components/ui/LineIcon/LineIcon';
import { RowButton } from '@/components/admin/RowActions/RowActions';
import pill from '@/components/admin/StatusPill/StatusPill.module.css';
import styles from './AuditTrail.module.css';

/** Field names as the office would say them. */
const FIELD_LABELS = {
  paidAmount: 'amount paid',
  dueDate: 'due date',
  resultDate: 'result date',
  isPublished: 'published',
  teacherAccess: 'portal access',
  assignedClasses: 'assigned classes',
  accountEmail: 'login email',
  classGroup: 'class',
  maxMarks: 'maximum marks',
  parentId: 'linked parent',
  studentId: 'student',
  facultyId: 'faculty member',
  effectiveDate: 'effective date',
  adminNote: 'office note',
  isActive: 'active',
};
const fieldLabel = (key) => FIELD_LABELS[key] ?? key.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();

const ROLE_LABELS = { ADMIN: 'Admin', EDITOR: 'Editor', TEACHER: 'Teacher', PARENT: 'Parent' };

/** Area name + colour, so a glance down the column tells fees from sign-ins. */
export const AREAS = {
  fees: { label: 'Fees', tone: 'gold' },
  results: { label: 'Results', tone: 'sky' },
  salary: { label: 'Salary', tone: 'gold' },
  students: { label: 'Students', tone: 'green' },
  parents: { label: 'Parents', tone: 'green' },
  faculty: { label: 'Faculty', tone: 'green' },
  homework: { label: 'Homework', tone: 'sky' },
  users: { label: 'Users', tone: 'red' },
  auth: { label: 'Sign-in', tone: 'muted' },
  applications: { label: 'Applications', tone: 'sky' },
  policies: { label: 'Policies', tone: 'muted' },
  content: { label: 'Website', tone: 'muted' },
  settings: { label: 'Settings', tone: 'red' },
};

/** What kind of change: add / edit / delete / other — drives the row icon. */
const verbOf = (action) => {
  const verb = String(action).split('.')[1] ?? '';
  if (verb === 'created') return { icon: 'check', tone: styles.add, text: 'Added' };
  if (verb === 'deleted') return { icon: 'alert', tone: styles.remove, text: 'Deleted' };
  if (verb === 'login_failed') return { icon: 'alert', tone: styles.remove, text: 'Failed' };
  if (verb === 'updated' || verb === 'role_changed') return { icon: 'pencil', tone: styles.change, text: 'Changed' };
  return { icon: 'info', tone: styles.other, text: verb.replace(/_/g, ' ') };
};

export function AreaTag({ category }) {
  const area = AREAS[category] ?? { label: category, tone: 'muted' };
  return <span className={cn(pill.pill, pill[area.tone])}>{area.label}</span>;
}

/** "Chrome on Windows" from a user-agent string — enough for the office. */
function browserName(ua) {
  if (!ua) return '';
  const browser = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Browser';
  const os = /Windows/.test(ua) ? 'Windows' : /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Mac OS/.test(ua) ? 'Mac' : /Linux/.test(ua) ? 'Linux' : '';
  return os ? `${browser} on ${os}` : browser;
}

/** The before → after table and technical footer shown when a row is expanded. */
function EntryDetails({ entry, changes }) {
  return (
    <div className={styles.details}>
      {changes.length > 0 ? (
        <table className={styles.changes}>
          <thead>
            <tr>
              <th>Field</th>
              <th>Before</th>
              <th>After</th>
            </tr>
          </thead>
          <tbody>
            {changes.map(([field, change]) => (
              <tr key={field}>
                <td>{fieldLabel(field)}</td>
                <td className={styles.before}>{String(change?.from ?? '—')}</td>
                <td className={styles.after}>{String(change?.to ?? '—')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className={styles.noChanges}>No field-by-field changes recorded for this entry.</p>
      )}
      <p className={styles.meta}>
        <span>{entry.action}</span>
        {entry.entityType && entry.entityId ? <span>{entry.entityType} #{entry.entityId}</span> : null}
        {entry.ipAddress ? <span>from {entry.ipAddress}</span> : null}
        {entry.userAgent ? <span>{browserName(entry.userAgent)}</span> : null}
      </p>
    </div>
  );
}

/** One row of the log table, expandable. */
function AuditRow({ entry }) {
  const [open, setOpen] = useState(false);
  const changes = entry.changes && typeof entry.changes === 'object' ? Object.entries(entry.changes) : [];
  const verb = verbOf(entry.action);

  return (
    <>
      <tr className={cn(styles.row, open && styles.rowOpen)}>
        <td className={styles.whenCell}>
          <time dateTime={entry.createdAt}>{formatDateTime(entry.createdAt)}</time>
        </td>
        <td className={styles.whoCell}>
          {entry.actorName ? (
            <>
              <b>{entry.actorName}</b>
              <small>{ROLE_LABELS[entry.actorRole] ?? entry.actorRole ?? ''}</small>
            </>
          ) : (
            <b className={styles.system}>System</b>
          )}
        </td>
        <td className={styles.areaCell}>
          <AreaTag category={entry.category} />
        </td>
        <td>
          <div className={styles.what}>
            <span className={cn(styles.verb, verb.tone)} title={verb.text}>
              <LineIcon name={verb.icon} size={14} strokeWidth={2.2} />
            </span>
            <span className={styles.summary}>{entry.summary}</span>
          </div>
        </td>
        <td className={styles.detailsCell}>
          <button type="button" className={styles.toggle} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
            {open ? 'Hide' : 'Details'}
          </button>
        </td>
      </tr>
      {open ? (
        <tr className={styles.detailsRow}>
          <td colSpan={5}>
            <EntryDetails entry={entry} changes={changes} />
          </td>
        </tr>
      ) : null}
    </>
  );
}

/** The log as a table — the Audit log page and the history modals. */
export function AuditTable({ entries, emptyTitle = 'Nothing recorded yet', emptyDescription }) {
  if (!entries.length) return <EmptyState title={emptyTitle} description={emptyDescription} />;
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>When</th>
            <th>Who</th>
            <th>Area</th>
            <th>What happened</th>
            <th aria-label="Details" />
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <AuditRow key={entry.id} entry={entry} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** A short list without details — the dashboard's Recent activity panel. */
export function AuditList({ entries, emptyTitle = 'Nothing recorded yet' }) {
  if (!entries.length) return <EmptyState title={emptyTitle} />;
  return (
    <ul className={styles.list}>
      {entries.map((entry) => {
        const verb = verbOf(entry.action);
        return (
          <li key={entry.id} className={styles.item}>
            <span className={cn(styles.verb, verb.tone)}>
              <LineIcon name={verb.icon} size={14} strokeWidth={2.2} />
            </span>
            <div className={styles.itemBody}>
              <span className={styles.itemSummary}>{entry.summary}</span>
              <small>
                {entry.actorName ?? 'System'} · {formatDateTime(entry.createdAt)}
              </small>
            </div>
            <AreaTag category={entry.category} />
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Everything logged about one record — a student's history, a teacher's
 * history — fetched on mount. Used inside a modal from the list pages.
 * @param {'Student'|'Faculty'|'Parent'|'User'} type
 */
export default function AuditTrail({ type, id }) {
  const [entries, setEntries] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setEntries(null);
    adminApi
      .get(`/admin/audit-log?entityType=${encodeURIComponent(type)}&entityId=${id}&limit=100`)
      .then((data) => setEntries(data.items))
      .catch((err) => setError(err.message));
  }, [type, id]);

  if (error) return <p role="alert">{error}</p>;
  if (entries === null) return <Loader label="Loading history…" size="sm" minHeight="120px" />;
  return <AuditTable entries={entries} emptyTitle="No changes recorded for this record yet" />;
}

/**
 * A "History" row button that opens the record's trail in a modal — drop it
 * into a list page's `extraRowActions`.
 */
export function HistoryButton({ type, id, label }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <RowButton onClick={() => setOpen(true)}>History</RowButton>
      <Modal open={open} onClose={() => setOpen(false)} title={`History — ${label}`} className={styles.modal}>
        {open ? <AuditTrail type={type} id={id} /> : null}
      </Modal>
    </>
  );
}
