'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import InternalRecordManager from '@/components/admin/InternalRecordManager/InternalRecordManager';
import { useClassSections, useSubjects } from '@/hooks/useClassSections';
import { adminApi } from '@/lib/adminApi';
import { resultColumns, resultFields, studentOptionsFrom } from '@/constants/academicRecords';
import { booleanFilter } from '@/components/admin/ListToolbar/ListToolbar';

/** Every class's results, including what teachers enter from their portal. */
export default function ResultsPage() {
  const classOptions = useClassSections();
  const subjectOptions = useSubjects();
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
      searchKeys={['studentName', 'exam', 'subject']}
      searchPlaceholder="Search by student, examination or subject…"
      filters={[
        { name: 'classGroup', label: 'Class', options: classOptions, placeholder: 'All classes' },
        { name: 'subject', label: 'Subject', options: subjectOptions, placeholder: 'All subjects' },
        booleanFilter('isPublished', 'Status', 'Published', 'Draft'),
      ]}
      singular="result"
      description="One row per student, examination and subject. Use Enter marks to fill in a whole class at once; add a single result here for a correction or a grade. A published result is visible only to that student's linked parent on the parent portal."
      extraActions={
        <Link href="/admin/results/enter" className="btn btn-outline btn-sm">
          Enter marks
        </Link>
      }
      columns={resultColumns}
      fields={resultFields({ classOptions, subjectOptions, studentOptions: studentOptionsFrom(students) })}
    />
  );
}
