'use client';

import { useEffect, useState } from 'react';
import InternalRecordManager from '@/components/admin/InternalRecordManager/InternalRecordManager';
import { useClassSections } from '@/hooks/useClassSections';
import { adminApi } from '@/lib/adminApi';
import { resultColumns, resultFields, studentOptionsFrom } from '@/constants/academicRecords';

/** Every class's results, including what teachers enter from their portal. */
export default function ResultsPage() {
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
      endpoint="/admin/results"
      title="Results"
      singular="result"
      description="Test and examination results, student by student. A published result is visible only to that student's linked parent on the parent portal."
      columns={resultColumns}
      fields={resultFields({ classOptions, studentOptions: studentOptionsFrom(students) })}
    />
  );
}
