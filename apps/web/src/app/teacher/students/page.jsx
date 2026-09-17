'use client';

import { useEffect, useState } from 'react';
import AdminPage from '@/components/admin/AdminPage/AdminPage';
import DataTable from '@/components/admin/DataTable/DataTable';
import { teacherApi } from '@/lib/adminApi';

/** Read-only register of the students in this teacher's classes. */
export default function TeacherStudentsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    teacherApi
      .get('/teacher/students')
      .then(setRows)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminPage
      title="My Students"
      description="Students registered in your assigned classes. The school office maintains this register."
    >
      <DataTable
        rows={rows}
        loading={loading}
        error={error}
        emptyTitle="No students in your classes yet"
        emptyDescription="Students appear here once the office registers them under your assigned classes."
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
