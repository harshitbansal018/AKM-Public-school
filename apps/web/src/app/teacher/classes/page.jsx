'use client';

import { useEffect, useState } from 'react';
import AdminPage from '@/components/admin/AdminPage/AdminPage';
import DataTable from '@/components/admin/DataTable/DataTable';
import { useAuth } from '@/context/AuthContext';
import { teacherApi } from '@/lib/adminApi';

/** The classes the administrator assigned on this teacher's faculty record. */
export default function TeacherClassesPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    teacherApi
      .get('/teacher/students')
      .then(setStudents)
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, []);

  const rows = (user?.assignedClasses ?? []).map((name) => ({
    id: name,
    name,
    students: students.filter((student) => student.classGroup === name).length,
  }));

  return (
    <AdminPage
      title="My Classes"
      description="Classes assigned to your account. Ask the school administrator to change these."
    >
      <DataTable
        rows={rows}
        loading={loading}
        emptyTitle="No classes assigned yet"
        emptyDescription="The school administrator assigns classes on your faculty record."
        columns={[
          { key: 'name', label: 'Class / section' },
          { key: 'students', label: 'Registered students', width: '200px' },
        ]}
      />
    </AdminPage>
  );
}
