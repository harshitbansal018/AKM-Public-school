'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import InternalRecordManager from '@/components/admin/InternalRecordManager/InternalRecordManager';
import { useAuth } from '@/context/AuthContext';
import { teacherApi } from '@/lib/adminApi';
import { useSubjects } from '@/hooks/useClassSections';
import { resultColumns, resultFields, studentOptionsFrom } from '@/constants/academicRecords';

/** Select class → examination → marks sheet → save → publish (and single corrections here). */
export default function TeacherResultsPage() {
  const { user } = useAuth();
  const subjectOptions = useSubjects('teacher');
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
      searchKeys={['studentName', 'exam', 'subject']}
      searchPlaceholder="Search by student, examination or subject…"
      filters={[
        { name: 'classGroup', label: 'Class', placeholder: 'All my classes', options: (user?.assignedClasses ?? []).map((name) => ({ value: name, label: name })) },
        { name: 'subject', label: 'Subject', options: subjectOptions, placeholder: 'All subjects' },
      ]}
      singular="result"
      description="Marks for students in your classes, one row per subject. Use Enter marks to fill in a whole class for an examination at once. A published result is visible only to that student's parent on the parent portal."
      emptyDescription="Results you enter for your assigned classes will be listed here."
      extraActions={
        <Link href="/teacher/results/enter" className="btn btn-outline btn-sm">
          Enter marks
        </Link>
      }
      columns={resultColumns}
      fields={resultFields({
        classOptions: (user?.assignedClasses ?? []).map((name) => ({ value: name, label: name })),
        subjectOptions,
        studentOptions: studentOptionsFrom(students),
      })}
    />
  );
}
