'use client';

import ChildPage from '@/components/parent/ChildPage/ChildPage';
import DataTable from '@/components/admin/DataTable/DataTable';
import StatCard from '@/components/admin/StatCard/StatCard';
import StatusPill from '@/components/admin/StatusPill/StatusPill';
import { formatLongDate, formatMoney } from '@/lib/format';
import dashboard from '@/app/admin/dashboard/dashboard.module.css';
import styles from '@/components/parent/ChildPage/ChildPage.module.css';

const FEE_STATUS = { PAID: 'active', PARTIAL: 'sky', DUE: 'NEW' };
const FEE_LABEL = { PAID: 'Paid', PARTIAL: 'Pending', DUE: 'Outstanding' };

/** Paid / pending / outstanding totals and every fee raised for this child. */
export default function ParentFeesPage() {
  return (
    <ChildPage title="Fees" description="Fees raised by the school and what has been paid.">
      {({ fees }) => (
        <>
          <div className={`${dashboard.grid} ${styles.tiles}`}>
            <StatCard icon="wallet" label="Total fees" value={formatMoney(fees.summary.total)} tone="royal" />
            <StatCard icon="check" label="Paid" value={formatMoney(fees.summary.paid)} tone="green" />
            <StatCard icon="clock" label="Outstanding" value={formatMoney(fees.summary.outstanding)} tone="red" />
            <StatCard
              icon="documents"
              label="Pending fees"
              value={fees.summary.pendingCount}
              hint={fees.summary.pendingCount === 0 ? 'All paid' : 'Not fully paid yet'}
              tone="gold"
            />
          </div>

          <DataTable
            rows={fees.records}
            emptyTitle="No fee records yet"
            columns={[
              { key: 'dueDate', label: 'Due date', nowrap: true, render: (r) => (r.dueDate ? formatLongDate(r.dueDate) : '—') },
              { key: 'amount', label: 'Amount', nowrap: true, render: (r) => formatMoney(r.amount) },
              { key: 'paidAmount', label: 'Paid', nowrap: true, render: (r) => formatMoney(r.paidAmount) },
              {
                key: 'outstanding',
                label: 'Outstanding',
                nowrap: true,
                render: (r) => formatMoney(Math.max(Number(r.amount) - Number(r.paidAmount), 0)),
              },
              {
                key: 'status',
                label: 'Status',
                width: '120px',
                render: (r) => <StatusPill value={FEE_STATUS[r.status] ?? 'sky'} label={FEE_LABEL[r.status] ?? r.status} />,
              },
              { key: 'notes', label: 'Notes' },
            ]}
          />
        </>
      )}
    </ChildPage>
  );
}
