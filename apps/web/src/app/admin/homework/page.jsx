'use client';

import InternalRecordManager from '@/components/admin/InternalRecordManager/InternalRecordManager';
import { useClassSections, useSubjects } from '@/hooks/useClassSections';
import { homeworkColumns, homeworkFields } from '@/constants/academicRecords';
import { booleanFilter } from '@/components/admin/ListToolbar/ListToolbar';

/** Every class's homework, including what teachers set from their portal. */
export default function HomeworkPage() {
  const classOptions = useClassSections();
  const subjectOptions = useSubjects();

  return (
    <InternalRecordManager
      endpoint="/admin/homework"
      title="Homework"
      searchKeys={['title', 'subject']}
      searchPlaceholder="Search by title or subject…"
      filters={[
        { name: 'classGroup', label: 'Class', options: classOptions, placeholder: 'All classes' },
        booleanFilter('isPublished', 'Status', 'Published', 'Draft'),
      ]}
      singular="homework item"
      description="Homework set by teachers and the office. Published items appear on the website's Homework page."
      columns={homeworkColumns}
      fields={homeworkFields({ classOptions, subjectOptions })}
    />
  );
}
