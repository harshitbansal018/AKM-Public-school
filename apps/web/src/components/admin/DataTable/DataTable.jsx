'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import Spinner from '@/components/ui/Spinner/Spinner';
import Pagination from '@/components/ui/Pagination/Pagination';
import styles from './DataTable.module.css';

/**
 * Admin list table.
 *
 * @param {object} props
 * @param {{key: string, label: string, render?: (row) => any, width?: string}[]} props.columns
 * @param {object[]} props.rows
 * @param {(row) => React.ReactNode} [props.actions]  buttons in the last column
 * @param {number} [props.pageSize]  rows per page; 0 shows everything
 */
export default function DataTable({
  columns,
  rows = [],
  actions,
  loading = false,
  error = '',
  emptyTitle = 'Nothing here yet',
  emptyDescription,
  emptyAction,
  pageSize = 25,
}) {
  const [page, setPage] = useState(1);
  const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(rows.length / pageSize)) : 1;

  // A new set of rows (search, filter, reload) starts again from page 1, and a
  // page beyond the end (after a delete) snaps back to the last one.
  useEffect(() => {
    setPage((current) => Math.min(Math.max(current, 1), totalPages));
  }, [totalPages]);
  useEffect(() => {
    setPage(1);
  }, [rows]);

  const pageRows = pageSize > 0 ? rows.slice((page - 1) * pageSize, page * pageSize) : rows;
  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, rows.length);
  if (loading) {
    return (
      <div className={styles.wrap}>
        <div className={styles.loading}>
          <Spinner size="sm" label="Loading…" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error} role="alert">
        <b>Could not load this list.</b>
        <span>{error}</span>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} style={column.width ? { width: column.width } : undefined}>
                {column.label}
              </th>
            ))}
            {actions ? <th className={styles.right}>Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {pageRows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => (
                <td key={column.key} className={cn(column.nowrap && styles.nowrap)}>
                  {column.render ? column.render(row) : (row[column.key] ?? '—')}
                </td>
              ))}
              {actions ? <td className={styles.right}>{actions(row)}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>

      {pageSize > 0 && rows.length > pageSize ? (
        <Pagination
          compact
          page={page}
          totalPages={totalPages}
          onChange={setPage}
          summary={`Showing ${first}–${last} of ${rows.length}`}
        />
      ) : null}
    </div>
  );
}
