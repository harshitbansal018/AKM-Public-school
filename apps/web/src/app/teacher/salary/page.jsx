'use client';

import { useEffect, useState } from 'react';
import AdminPage from '@/components/admin/AdminPage/AdminPage';
import DataTable from '@/components/admin/DataTable/DataTable';
import StatCard from '@/components/admin/StatCard/StatCard';
import StatusPill from '@/components/admin/StatusPill/StatusPill';
import { teacherApi } from '@/lib/adminApi';
import { formatLongDate, formatMoney } from '@/lib/format';
import dashboard from '@/app/admin/dashboard/dashboard.module.css';

const sum = (rows) => rows.reduce((total, row) => total + Number(row.amount), 0);

/** The signed-in teacher's own salary months, as recorded by the office. */
export default function TeacherSalaryPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    teacherApi
      .get('/teacher/salary')
      .then(setRows)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const paid = rows.filter((row) => row.status === 'PAID');
  const due = rows.filter((row) => row.status !== 'PAID');

  return (
    <AdminPage
      title="My Salary"
      description="Your salary months as recorded by the school office. For any query about an amount or a payment, please contact the office."
    >
      {rows.length ? (
        <div className={dashboard.grid}>
          <StatCard icon="check" label="Paid" value={formatMoney(sum(paid))} hint={`${paid.length} month${paid.length === 1 ? '' : 's'}`} tone="green" />
          <StatCard icon="clock" label="Due" value={formatMoney(sum(due))} hint={due.length ? `${due.length} month${due.length === 1 ? '' : 's'} pending` : 'Nothing pending'} tone="red" />
          <StatCard
            icon="calendar"
            label="Last paid"
            value={paid[0]?.month ?? '—'}
            hint={paid[0]?.paymentDate ? formatLongDate(paid[0].paymentDate) : undefined}
            tone="royal"
          />
        </div>
      ) : null}

      <DataTable
        rows={rows}
        loading={loading}
        error={error}
        emptyTitle="No salary records yet"
        emptyDescription="Months appear here once the office records them against your faculty record."
        columns={[
          { key: 'month', label: 'Month', nowrap: true, render: (r) => <b>{r.month}</b> },
          { key: 'amount', label: 'Amount', nowrap: true, render: (r) => formatMoney(r.amount) },
          { key: 'paymentDate', label: 'Paid on', nowrap: true, render: (r) => (r.paymentDate ? formatLongDate(r.paymentDate) : '—') },
          {
            key: 'status',
            label: 'Status',
            width: '100px',
            render: (r) => <StatusPill value={r.status === 'PAID' ? 'active' : 'NEW'} label={r.status === 'PAID' ? 'Paid' : 'Due'} />,
          },
          { key: 'notes', label: 'Notes' },
        ]}
      />
    </AdminPage>
  );
}
