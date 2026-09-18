'use client';

import { useEffect, useState } from 'react';
import AdminPage from '@/components/admin/AdminPage/AdminPage';
import DataTable from '@/components/admin/DataTable/DataTable';
import ListToolbar, { applyListFilters } from '@/components/admin/ListToolbar/ListToolbar';
import { useAuth } from '@/context/AuthContext';
import { teacherApi } from '@/lib/adminApi';

const SEARCH_KEYS = ['name', 'rollNumber', 'guardianName'];

/** Read-only register of the students in this teacher's classes. */
export default function TeacherStudentsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [values, setValues] = useState({});

  useEffect(() => {
    teacherApi
      .get('/teacher/students')
      .then(setRows)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filters = [
    {
      name: 'classGroup',
      label: 'Class',
      placeholder: 'All my classes',
      options: (user?.assignedClasses ?? []).map((name) => ({ value: name, label: name })),
    },
  ];
  const visible = applyListFilters(rows, { search, searchKeys: SEARCH_KEYS, filters, values });
  const narrowed = visible.length !== rows.length;

  return (
    <AdminPage
      title="My Students"
      description="Students registered in your assigned classes. The school office maintains this register."
    >
      <ListToolbar
        searchPlaceholder="Search by student, roll no. or guardian…"
        search={search}
        onSearch={setSearch}
        filters={filters}
        values={values}
        onFilter={(name, value) => setValues((current) => ({ ...current, [name]: value }))}
        summary={rows.length ? `${visible.length} of ${rows.length}` : undefined}
      />
      <DataTable
        rows={visible}
        loading={loading}
        error={error}
        emptyTitle={narrowed ? 'No students match' : 'No students in your classes yet'}
        emptyDescription={
          narrowed
            ? 'Try clearing the search or filters.'
            : 'Students appear here once the office registers them under your assigned classes.'
        }
        columns={[
          { key: 'name', label: 'Student' },
          { key: 'classGroup', label: 'Class' },
          { key: 'rollNumber', label: 'Roll no.' },
          { key: 'guardianName', label: 'Parent / guardian' },
          { key: 'phone', label: 'Phone' },
        ]}
      />
    </AdminPage>
  );
}
