'use client';

import { useEffect, useMemo, useState } from 'react';
import InternalRecordManager from '@/components/admin/InternalRecordManager/InternalRecordManager';
import StatusPill from '@/components/admin/StatusPill/StatusPill';
import StatCard from '@/components/admin/StatCard/StatCard';
import Select from '@/components/ui/Select/Select';
import { RowButton } from '@/components/admin/RowActions/RowActions';
import Spinner from '@/components/ui/Spinner/Spinner';
import { adminApi } from '@/lib/adminApi';
import { formatLongDate, formatMoney } from '@/lib/format';
import dashboard from '@/app/admin/dashboard/dashboard.module.css';

const sum = (rows) => rows.reduce((total, row) => total + Number(row.amount), 0);

/**
 * Salary months per teacher. Pick the teacher from the faculty list, raise the
 * month as Due, then press "Mark paid" when the payment is made — that is the
 * payment workflow. Teachers see their own months on the teacher portal.
 */
export default function FacultySalaryPage() {
  const [faculty, setFaculty] = useState([]);
  const [facultyFilter, setFacultyFilter] = useState('');

  useEffect(() => {
    adminApi
      .get('/admin/faculty')
      .then(setFaculty)
      .catch(() => setFaculty([]));
  }, []);

  const facultyOptions = useMemo(
    () => faculty.map((person) => ({ value: person.id, label: `${person.name} — ${person.designation}` })),
    [faculty]
  );

  const filterRows = (rows) =>
    facultyFilter ? rows.filter((row) => String(row.facultyId) === facultyFilter) : rows;

  return (
    <InternalRecordManager
      endpoint="/admin/faculty-salary"
      title="Faculty Salary"
      singular="salary month"
      description="One record per teacher per month. Raise it as Due, then mark it paid when the payment is made. Each teacher sees only their own months on the teacher portal."
      filterRows={filterRows}
      toolbar={(items) => {
        const rows = filterRows(items);
        const due = rows.filter((row) => row.status !== 'PAID');
        return (
          <>
            <div className={dashboard.grid}>
              <StatCard icon="banknote" label="Paid" value={formatMoney(sum(rows.filter((r) => r.status === 'PAID')))} hint={facultyFilter ? 'This teacher' : 'All teachers'} tone="green" />
              <StatCard icon="clock" label="Due" value={formatMoney(sum(due))} hint={`${due.length} month${due.length === 1 ? '' : 's'} unpaid`} tone="red" />
            </div>
            <div style={{ maxWidth: 380, marginBottom: 18 }}>
              <Select
                id="facultyFilter"
                label="Show one teacher"
                placeholder="All teachers"
                options={facultyOptions}
                value={facultyFilter}
                onChange={(e) => setFacultyFilter(e.target.value)}
              />
            </div>
          </>
        );
      }}
      columns={[
        { key: 'facultyName', label: 'Faculty member' },
        { key: 'month', label: 'Month', nowrap: true },
        { key: 'amount', label: 'Amount', nowrap: true, render: (r) => formatMoney(r.amount) },
        { key: 'paymentDate', label: 'Paid on', nowrap: true, render: (r) => (r.paymentDate ? formatLongDate(r.paymentDate) : '—') },
        {
          key: 'status',
          label: 'Status',
          width: '100px',
          render: (r) => <StatusPill value={r.status === 'PAID' ? 'active' : 'NEW'} label={r.status === 'PAID' ? 'Paid' : 'Due'} />,
        },
      ]}
      extraRowActions={(row, { patch, saving }) =>
        row.status !== 'PAID' ? (
          <RowButton tone="success" disabled={saving} onClick={() => patch(`/${row.id}/pay`, {}, 'Marked as paid')}>
            {saving ? <Spinner size="xs" /> : null} Mark paid
          </RowButton>
        ) : null
      }
      fields={[
        {
          name: 'facultyId',
          label: 'Faculty member',
          type: 'select',
          options: facultyOptions,
          placeholder: 'Choose a teacher…',
          required: true,
        },
        { name: 'month', label: 'Salary month', type: 'text', required: true, half: true, placeholder: 'September 2026' },
        { name: 'amount', label: 'Amount (₹)', type: 'number', required: true, half: true },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          half: true,
          options: [
            { value: 'DUE', label: 'Due' },
            { value: 'PAID', label: 'Paid' },
          ],
        },
        { name: 'paymentDate', label: 'Payment date', type: 'date', half: true, help: 'Fill in when marking as paid; "Mark paid" in the list uses today.' },
        { name: 'notes', label: 'Notes', type: 'textarea', rows: 3, placeholder: 'Transfer reference, deductions, advance…' },
      ]}
    />
  );
}
