'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import AdminPage from '@/components/admin/AdminPage/AdminPage';
import Spinner, { Loader } from '@/components/ui/Spinner/Spinner';
import { useToast } from '@/hooks/useToast';
import { adminApi } from '@/lib/adminApi';
import { formatLongDate } from '@/lib/format';
import styles from './print.module.css';

/** One report as a printable table. The sidebar and buttons drop out when printing. */
export default function ReportPrintPage() {
  // useSearchParams needs a Suspense boundary above it when the page is prerendered.
  return (
    <Suspense fallback={<Loader />}>
      <ReportPrint />
    </Suspense>
  );
}

function ReportPrint() {
  const { report: key } = useParams();
  const params = useSearchParams();
  const toast = useToast();
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  const query = params.toString();

  useEffect(() => {
    adminApi
      .get(`/admin/reports/${key}${query ? `?${query}` : ''}`)
      .then(setReport)
      .catch((err) => setError(err.message));
  }, [key, query]);

  const exportCsv = async () => {
    setExporting(true);
    try {
      await adminApi.download(
        `/admin/reports/${key}?format=csv${query ? `&${query}` : ''}`,
        `${key}-${new Date().toISOString().slice(0, 10)}.csv`
      );
    } catch (err) {
      toast.error(err.message);
    } finally {
      setExporting(false);
    }
  };

  if (error) {
    return (
      <AdminPage title="Report" description={<Link href="/admin/reports">← All reports</Link>}>
        <p role="alert">{error}</p>
      </AdminPage>
    );
  }
  if (!report) {
    return (
      <AdminPage title="Report">
        <Loader label="Preparing report…" />
      </AdminPage>
    );
  }

  const applied = Object.entries(report.filters ?? {}).filter(([, value]) => value);

  return (
    <AdminPage
      title={report.label}
      description={
        <>
          {report.rows.length} {report.rows.length === 1 ? 'record' : 'records'} ·{' '}
          <Link href="/admin/reports">← All reports</Link>
        </>
      }
      action={
        <>
          <button type="button" className="btn btn-outline btn-sm" onClick={exportCsv} disabled={exporting}>
            {exporting ? <Spinner size="xs" /> : null} Export CSV
          </button>
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
            <h2>{report.label}</h2>
          </div>
          <div className={styles.meta}>
            <span>Generated {formatLongDate(report.generatedAt)}</span>
            {applied.length ? (
              <span>
                Filters:{' '}
                {applied.map(([name, value]) => `${name} = ${value}`).join(' · ')}
              </span>
            ) : (
              <span>All records</span>
            )}
          </div>
        </header>

        {report.rows.length === 0 ? (
          <p className={styles.none}>No records match these filters.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                {report.columns.map((column) => (
                  <th key={column.key}>{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.rows.map((row, index) => (
                <tr key={index}>
                  {report.columns.map((column) => (
                    <td key={column.key}>{row[column.key] === '' ? '—' : String(row[column.key])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </article>
    </AdminPage>
  );
}
