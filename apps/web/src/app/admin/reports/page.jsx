'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminPage from '@/components/admin/AdminPage/AdminPage';
import Input from '@/components/ui/Input/Input';
import Select from '@/components/ui/Select/Select';
import Spinner, { Loader } from '@/components/ui/Spinner/Spinner';
import { useClassSections } from '@/hooks/useClassSections';
import { useToast } from '@/hooks/useToast';
import { adminApi } from '@/lib/adminApi';
import { statusLabel } from '@/constants/jobApplications';
import styles from './reportsPage.module.css';

/** Nicer labels for the raw status codes the API filters by. */
const STATUS_LABELS = {
  PUBLISHED: 'Published',
  DRAFT: 'Draft',
  DUE: 'Due',
  PARTIAL: 'Partially paid',
  PAID: 'Paid',
  NEW: 'New',
  CONTACTED: 'Contacted',
  ADMITTED: 'Admitted',
  CLOSED: 'Closed',
};
const AUDIT_AREAS = {
  fees: 'Fees', results: 'Results', salary: 'Faculty salary', students: 'Students', parents: 'Parents',
  faculty: 'Faculty', homework: 'Homework', users: 'Users & permissions', auth: 'Sign-ins',
  applications: 'Job applications', policies: 'Policies', content: 'Website content', settings: 'Settings',
};
const label = (value) => STATUS_LABELS[value] ?? AUDIT_AREAS[value] ?? statusLabel(value);

const DATE_LABELS = { createdAt: 'Created', dueDate: 'Due', resultDate: 'Result date', paymentDate: 'Paid on' };

/** Query string for one report's chosen filters — shared by CSV and print. */
const toQuery = (filters) =>
  Object.entries(filters)
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

/**
 * Reports / Print. Every category the office keeps can be filtered, exported
 * to Excel (CSV) or opened as a print-friendly sheet.
 */
export default function ReportsPage() {
  const toast = useToast();
  const classOptions = useClassSections();
  const [reports, setReports] = useState(null);
  const [filters, setFilters] = useState({});
  const [exporting, setExporting] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi
      .get('/admin/reports')
      .then(setReports)
      .catch((err) => setError(err.message));
  }, []);

  const setFilter = (key, field, value) =>
    setFilters((current) => ({ ...current, [key]: { ...current[key], [field]: value } }));

  const exportCsv = async (report) => {
    setExporting(report.key);
    try {
      const query = toQuery(filters[report.key] ?? {});
      await adminApi.download(
        `/admin/reports/${report.key}?format=csv${query ? `&${query}` : ''}`,
        `${report.key}-${new Date().toISOString().slice(0, 10)}.csv`
      );
      toast.success(`${report.label} exported`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setExporting(null);
    }
  };

  return (
    <AdminPage
      title="Reports / Print"
      description="Export any register to Excel (CSV) or open a print-friendly copy. Narrow a report by class, status or date range before exporting."
    >
      {error ? <p role="alert">{error}</p> : null}
      {reports === null && !error ? <Loader label="Loading reports…" /> : null}

      <div className={styles.grid}>
        {(reports ?? []).map((report) => {
          const chosen = filters[report.key] ?? {};
          const query = toQuery(chosen);
          return (
            <section key={report.key} className={styles.card}>
              <div className={styles.head}>
                <div>
                  <h2>{report.label}</h2>
                  <p>{report.description}</p>
                </div>
                <span className={styles.count}>
                  {report.count} {report.count === 1 ? 'record' : 'records'}
                </span>
              </div>

              <div className={styles.filters}>
                {report.filters.includes('classGroup') ? (
                  <Select
                    id={`${report.key}-class`}
                    label="Class"
                    placeholder="All classes"
                    options={classOptions}
                    value={chosen.classGroup ?? ''}
                    onChange={(e) => setFilter(report.key, 'classGroup', e.target.value)}
                  />
                ) : null}
                {report.filters.includes('status') ? (
                  <Select
                    id={`${report.key}-status`}
                    label="Status"
                    placeholder="Any status"
                    options={report.statuses.map((value) => ({ value, label: label(value) }))}
                    value={chosen.status ?? ''}
                    onChange={(e) => setFilter(report.key, 'status', e.target.value)}
                  />
                ) : null}
                {report.filters.includes('dates') ? (
                  <>
                    <Input
                      id={`${report.key}-from`}
                      type="date"
                      label={`${DATE_LABELS[report.dateField] ?? 'Date'} from`}
                      value={chosen.from ?? ''}
                      onChange={(e) => setFilter(report.key, 'from', e.target.value)}
                    />
                    <Input
                      id={`${report.key}-to`}
                      type="date"
                      label="to"
                      value={chosen.to ?? ''}
                      onChange={(e) => setFilter(report.key, 'to', e.target.value)}
                    />
                  </>
                ) : null}
              </div>

              <div className={styles.actions}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => exportCsv(report)}
                  disabled={exporting === report.key}
                >
                  {exporting === report.key ? <Spinner size="xs" /> : null} Export CSV
                </button>
                <Link
                  href={`/admin/reports/${report.key}${query ? `?${query}` : ''}`}
                  className="btn btn-outline btn-sm"
                >
                  Print view
                </Link>
              </div>
            </section>
          );
        })}
      </div>
    </AdminPage>
  );
}
