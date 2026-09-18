'use client';

import { useEffect, useState } from 'react';
import AdminPage from '@/components/admin/AdminPage/AdminPage';
import { adminApi } from '@/lib/adminApi';
import { Loader } from '@/components/ui/Spinner/Spinner';

const sources = [
  ['Students', '/admin/students'],
  ['Homework', '/admin/homework'],
  ['Results', '/admin/results'],
  ['Fee records', '/admin/fees'],
  ['Salary records', '/admin/faculty-salary'],
  ['Job applications', '/admin/job-applications'],
  ['Enquiries', '/admin/enquiries'],
];

export default function ReportsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all(sources.map(async ([label, endpoint]) => {
      const data = await adminApi.get(endpoint);
      return { label, count: Array.isArray(data) ? data.length : data?.items?.length ?? 0 };
    }))
      .then(setRows)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminPage
      title="Reports"
      description="A printable summary of records currently held in the admin panel."
      action={<button type="button" className="btn btn-primary btn-sm" onClick={() => window.print()}>Print report</button>}
    >
      {error ? <p role="alert">Unable to load report: {error}</p> : null}
      {loading ? <Loader label="Counting records…" /> : null}
      <table hidden={loading} style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr><th style={{ textAlign: 'left', padding: 12 }}>Record type</th><th style={{ textAlign: 'right', padding: 12 }}>Total</th></tr></thead>
        <tbody>{rows.map((row) => <tr key={row.label}><td style={{ padding: 12 }}>{row.label}</td><td style={{ padding: 12, textAlign: 'right' }}>{row.count}</td></tr>)}</tbody>
      </table>
    </AdminPage>
  );
}
