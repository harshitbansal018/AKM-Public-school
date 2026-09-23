'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminPage from '@/components/admin/AdminPage/AdminPage';
import Input from '@/components/ui/Input/Input';
import Select from '@/components/ui/Select/Select';
import Pagination from '@/components/ui/Pagination/Pagination';
import { Loader } from '@/components/ui/Spinner/Spinner';
import { AuditTable, AREAS } from '@/components/admin/AuditTrail/AuditTrail';
import { useToast } from '@/hooks/useToast';
import { adminApi } from '@/lib/adminApi';
import styles from './auditLog.module.css';

const PAGE_SIZE = 25;
const EMPTY_FILTERS = { q: '', category: '', actorKind: '', from: '', to: '' };

const toQuery = (values) =>
  Object.entries(values)
    .filter(([, value]) => value !== '' && value !== undefined && value !== null)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

/**
 * Audit log: who changed what, newest first. Read-only — there is no edit or
 * delete, not even for administrators. Filters run on the server because the
 * log grows without limit.
 */
export default function AuditLogPage() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [search, setSearch] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  // Typing in the search box waits a moment before asking the server.
  useEffect(() => {
    const handle = setTimeout(() => setFilter('q', search.trim()), 350);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setError('');
    adminApi
      .get(`/admin/audit-log?page=${page}&limit=${PAGE_SIZE}&${toQuery(filters)}`)
      .then((result) => !cancelled && setData(result))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [page, filters]);

  const setFilter = (name, value) => {
    setFilters((current) => {
      if (current[name] === value) return current;
      setPage(1);
      return { ...current, [name]: value };
    });
  };

  const clearFilters = () => {
    setSearch('');
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      const query = toQuery({ status: filters.category, from: filters.from, to: filters.to });
      await adminApi.download(
        `/admin/reports/audit?format=csv${query ? `&${query}` : ''}`,
        `audit-log-${new Date().toISOString().slice(0, 10)}.csv`
      );
      toast.success('Audit log exported');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setExporting(false);
    }
  };

  const items = data?.items ?? [];
  const meta = data?.meta;
  const filtering = Boolean(toQuery(filters));

  return (
    <AdminPage
      title="Audit log"
      description="Every important action — fee updates, result changes, salary payments, account and role changes, sign-ins — with who did it, when, and exactly what changed. Entries cannot be edited or deleted."
      action={
        <>
          <Link href="/admin/reports/audit" target="_blank" className="btn btn-outline btn-sm">
            Print
          </Link>
          <button type="button" className="btn btn-primary btn-sm" onClick={exportCsv} disabled={exporting}>
            {exporting ? 'Exporting…' : 'Export CSV'}
          </button>
        </>
      }
    >
      <section className={styles.filters}>
        <div className={styles.grid}>
          <Input
            id="audit-search"
            label="Search"
            placeholder="Name, record or details…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.search}
          />
          <Select
            id="audit-area"
            label="Area"
            placeholder="All areas"
            options={Object.entries(AREAS).map(([value, area]) => ({ value, label: area.label }))}
            value={filters.category}
            onChange={(e) => setFilter('category', e.target.value)}
          />
          <Select
            id="audit-who"
            label="Who"
            placeholder="Anyone"
            options={[
              { value: 'user', label: 'Admin panel users' },
              { value: 'faculty', label: 'Teachers' },
              { value: 'parent', label: 'Parents' },
              { value: 'system', label: 'System' },
            ]}
            value={filters.actorKind}
            onChange={(e) => setFilter('actorKind', e.target.value)}
          />
          <Input id="audit-from" type="date" label="From" value={filters.from} onChange={(e) => setFilter('from', e.target.value)} />
          <Input id="audit-to" type="date" label="To" value={filters.to} onChange={(e) => setFilter('to', e.target.value)} />
        </div>

        <div className={styles.filterFoot}>
          <span className={styles.count}>
            {meta ? `${meta.total.toLocaleString('en-IN')} ${meta.total === 1 ? 'entry' : 'entries'}` : ''}
            {filtering && meta ? ' match' : ''}
          </span>
          {filtering ? (
            <button type="button" className="btn btn-outline btn-sm" onClick={clearFilters}>
              Clear filters
            </button>
          ) : null}
        </div>
      </section>

      {error ? (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      ) : null}
      {data === null && !error ? <Loader label="Loading audit log…" /> : null}
      {data ? (
        <AuditTable
          entries={items}
          emptyTitle={filtering ? 'No entries match these filters' : 'Nothing recorded yet'}
          emptyDescription={filtering ? 'Try clearing the search or filters.' : 'Changes to fees, results, salaries and accounts will appear here as they happen.'}
        />
      ) : null}

      {meta && meta.total > 0 ? (
        <div className={styles.paging}>
          <Pagination
            compact
            page={meta.page}
            totalPages={meta.totalPages}
            onChange={setPage}
            summary={`Showing ${(meta.page - 1) * meta.limit + 1}–${Math.min(meta.page * meta.limit, meta.total)} of ${meta.total}`}
          />
        </div>
      ) : null}
    </AdminPage>
  );
}
