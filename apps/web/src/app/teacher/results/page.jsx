'use client';

import { useEffect, useState } from 'react';
import InternalRecordManager from '@/components/admin/InternalRecordManager/InternalRecordManager';
import { useAuth } from '@/context/AuthContext';
import { teacherApi } from '@/lib/adminApi';
import { resultColumns, resultFields, studentOptionsFrom } from '@/constants/academicRecords';

/** Select class → select student → enter marks → save → publish. */
export default function TeacherResultsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);

  useEffect(() => {
    teacherApi
      .get('/teacher/students')
      .then(setStudents)
      .catch(() => setStudents([]));
  }, []);

  return (
    <InternalRecordManager
      endpoint="/teacher/results"
      title="Results"
      singular="result"
      description="Enter test and examination results for students in your classes. A published result is visible only to that student's parent on the parent portal."
      emptyDescription="Results you enter for your assigned classes will be listed here."
      columns={resultColumns}
      fields={resultFields({
        classOptions: (user?.assignedClasses ?? []).map((name) => ({ value: name, label: name })),
        studentOptions: studentOptionsFrom(students),
      })}
    />
  );
}
