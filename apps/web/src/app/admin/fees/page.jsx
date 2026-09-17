'use client';

import { useEffect, useState } from 'react';
import InternalRecordManager from '@/components/admin/InternalRecordManager/InternalRecordManager';
import StatusPill from '@/components/admin/StatusPill/StatusPill';
import { useClassSections } from '@/hooks/useClassSections';
import { adminApi } from '@/lib/adminApi';
import { formatLongDate, formatMoney } from '@/lib/format';
import { studentFields, studentOptionsFrom } from '@/constants/academicRecords';

const FEE_STATUS = { PAID: 'active', PARTIAL: 'sky', DUE: 'NEW' };

/**
 * Fee records per student. Marking a record Paid fills the paid amount for
 * you; Partially paid takes the amount received so far. Parents see these
 * rows, with paid / outstanding totals, on their portal.
 */
export default function FeesPage() {
  const classOptions = useClassSections();
  const [students, setStudents] = useState([]);

  useEffect(() => {
    adminApi
      .get('/admin/students')
      .then(setStudents)
      .catch(() => setStudents([]));
  }, []);

  return (
    <InternalRecordManager
      endpoint="/admin/fees"
      title="Fees"
      singular="fee record"
      description="Fees raised and payments received, student by student. Parents see their own child's records on the parent portal."
      columns={[
        { key: 'studentName', label: 'Student' },
        { key: 'classGroup', label: 'Class' },
        { key: 'amount', label: 'Amount', nowrap: true, render: (r) => formatMoney(r.amount) },
        { key: 'paidAmount', label: 'Paid', nowrap: true, render: (r) => formatMoney(r.paidAmount) },
        { key: 'dueDate', label: 'Due date', nowrap: true, render: (r) => (r.dueDate ? formatLongDate(r.dueDate) : '—') },
        {
          key: 'status',
          label: 'Status',
          width: '110px',
          render: (r) => <StatusPill value={FEE_STATUS[r.status] ?? 'sky'} label={r.status} />,
        },
      ]}
      fields={[
        ...studentFields({ classOptions, studentOptions: studentOptionsFrom(students) }),
        { name: 'amount', label: 'Fee amount (₹)', type: 'number', required: true, half: true },
        { name: 'dueDate', label: 'Due date', type: 'date', half: true },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          half: true,
          options: [
            { value: 'DUE', label: 'Due — nothing paid yet' },
            { value: 'PARTIAL', label: 'Partially paid' },
            { value: 'PAID', label: 'Paid in full' },
          ],
        },
        {
          name: 'paidAmount',
          label: 'Amount paid so far (₹)',
          type: 'number',
          half: true,
          help: 'Only needed for Partially paid. Paid fills this in automatically; Due resets it to 0.',
        },
        { name: 'notes', label: 'Notes', type: 'textarea', rows: 3, placeholder: 'Receipt no., term, mode of payment…' },
      ]}
    />
  );
}
