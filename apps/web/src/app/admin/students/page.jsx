'use client';

import { useEffect, useState } from 'react';
import InternalRecordManager from '@/components/admin/InternalRecordManager/InternalRecordManager';
import { useClassSections } from '@/hooks/useClassSections';
import { adminApi } from '@/lib/adminApi';

/**
 * The student register. Each student is filed under a class (which is what
 * teachers are assigned to) and can be linked to a parent-portal account.
 */
export default function StudentsPage() {
  const classOptions = useClassSections();
  const [parents, setParents] = useState([]);

  useEffect(() => {
    adminApi
      .get('/admin/parents')
      .then(setParents)
      .catch(() => setParents([]));
  }, []);

  return (
    <InternalRecordManager
      endpoint="/admin/students"
      title="Students"
      searchKeys={['name', 'rollNumber', 'guardianName', 'phone']}
      searchPlaceholder="Search by student, roll no., guardian or phone…"
      filters={[{ name: 'classGroup', label: 'Class', options: classOptions, placeholder: 'All classes' }]}
      singular="student"
      description="Maintain the school’s internal student register. Link each student to their parent's portal account so the parent can see homework, results and fees."
      columns={[
        { key: 'name', label: 'Student' },
        { key: 'classGroup', label: 'Class' },
        { key: 'rollNumber', label: 'Roll no.' },
        { key: 'guardianName', label: 'Parent / guardian' },
        { key: 'phone', label: 'Phone' },
        {
          key: 'parent',
          label: 'Parent login',
          render: (r) => (r.parent ? r.parent.email : <span style={{ color: 'var(--muted)' }}>Not linked</span>),
        },
      ]}
      fields={[
        { name: 'name', label: 'Student name', type: 'text', required: true },
        {
          name: 'classGroup',
          label: 'Class / section',
          type: 'select',
          options: classOptions,
          placeholder: 'Choose a class…',
          required: true,
          half: true,
        },
        { name: 'rollNumber', label: 'Roll number', type: 'text', half: true },
        { name: 'guardianName', label: 'Parent / guardian', type: 'text', required: true },
        { name: 'phone', label: 'Phone', type: 'text' },
        { name: 'address', label: 'Address', type: 'textarea', rows: 3 },
        {
          name: 'parentId',
          label: 'Parent portal account',
          type: 'select',
          placeholder: 'Not linked',
          options: parents.map((parent) => ({ value: parent.id, label: `${parent.name} — ${parent.email}` })),
          help: 'Accounts are created under Parents. The linked parent can see this student’s homework, results and fees.',
        },
      ]}
    />
  );
}
