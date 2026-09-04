'use client';

import { cn } from '@/lib/cn';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import styles from './DataTable.module.css';

/**
 * Admin list table.
 *
 * @param {object} props
 * @param {{key: string, label: string, render?: (row) => any, width?: string}[]} props.columns
 * @param {object[]} props.rows
 * @param {(row) => React.ReactNode} [props.actions]  buttons in the last column
 */
export default function DataTable({
  columns,
  rows = [],
  actions,
  loading = false,
  error = '',
  emptyIcon = '📭',
  emptyTitle = 'Nothing here yet',
  emptyDescription,
  emptyAction,
}) {
  if (loading) {
    return (
      <div className={styles.wrap}>
        <div className={styles.loading}>
          <span className={styles.spinner} aria-hidden="true" />
          Loading…
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
        icon={emptyIcon}
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
          {rows.map((row) => (
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
    </div>
  );
}
