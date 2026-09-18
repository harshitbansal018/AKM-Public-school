'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { adminApi } from '@/lib/adminApi';
import { useToast } from '@/hooks/useToast';
import { formatLongDate } from '@/lib/format';
import AdminPage from '@/components/admin/AdminPage/AdminPage';
import StatusPill from '@/components/admin/StatusPill/StatusPill';
import Spinner from '@/components/ui/Spinner/Spinner';
import { Loader } from '@/components/ui/Spinner/Spinner';
import { statusLabel, statusTone } from '@/constants/jobApplications';
import styles from './application.module.css';

/**
 * One application as a printable sheet — what the interview panel gets on
 * paper. Everything but the sheet is hidden when printing.
 */
export default function ApplicationSheetPage() {
  const { id } = useParams();
  const toast = useToast();
  const [row, setRow] = useState(null);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    adminApi
      .get(`/admin/job-applications/${id}`)
      .then(setRow)
      .catch((err) => setError(err.message));
  }, [id]);

  const downloadCv = async () => {
    setDownloading(true);
    try {
      await adminApi.download(`/admin/job-applications/${id}/resume`, row.resumeName || `${row.reference}-cv`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDownloading(false);
    }
  };

  if (error) {
    return (
      <AdminPage title="Application" description={<Link href="/admin/job-applications">← All applications</Link>}>
        <p role="alert">{error}</p>
      </AdminPage>
    );
  }
  if (!row) {
    return (
      <AdminPage title="Application">
        <Loader label="Loading application…" />
      </AdminPage>
    );
  }

  const fields = [
    ['Position applied for', row.position],
    ['Subject', row.subject],
    ['Highest qualification', row.qualification],
    ['Experience', row.experience],
    ['Current / last school', row.currentSchool],
    ['Phone', row.phone],
    ['Email', row.email],
    ['City / town', row.address],
    ['CV', row.resumeName ? `Attached — ${row.resumeName}` : 'Not attached'],
  ];

  return (
    <AdminPage
      title={row.name}
      description={
        <>
          Application {row.reference ?? `#${row.id}`} · received {formatLongDate(row.createdAt)} ·{' '}
          <Link href="/admin/job-applications">← All applications</Link>
        </>
      }
      action={
        <>
          {row.resumePath ? (
            <button type="button" className="btn btn-outline btn-sm" onClick={downloadCv} disabled={downloading}>
              {downloading ? <Spinner size="xs" /> : null} Download CV
            </button>
          ) : null}
          <button type="button" className="btn btn-primary btn-sm" onClick={() => window.print()}>
            Print
          </button>
        </>
      }
    >
      <article className={styles.sheet}>
        <header className={styles.head}>
          <div>
            <p className={styles.school}>AKM Public Sr. Sec. School</p>
            <h2>Job Application</h2>
          </div>
          <dl className={styles.meta}>
            <div>
              <dt>Reference</dt>
              <dd>{row.reference ?? `#${row.id}`}</dd>
            </div>
            <div>
              <dt>Received</dt>
              <dd>{formatLongDate(row.createdAt)}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <StatusPill value={statusTone(row.status)} label={statusLabel(row.status)} />
              </dd>
            </div>
          </dl>
        </header>

        <h3 className={styles.name}>{row.name}</h3>

        <dl className={styles.grid}>
          {fields.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value || '—'}</dd>
            </div>
          ))}
        </dl>

        <section className={styles.block}>
          <h4>Applicant&rsquo;s message</h4>
          <p>{row.notes || '—'}</p>
        </section>

        <section className={styles.block}>
          <h4>Office notes</h4>
          <p>{row.adminNote || '—'}</p>
        </section>

        <section className={styles.panel}>
          <h4>Interview panel</h4>
          <div className={styles.lines}>
            <span>Demo lesson remarks</span>
            <span>Recommendation</span>
            <span>Signature &amp; date</span>
          </div>
        </section>
      </article>
    </AdminPage>
  );
}
