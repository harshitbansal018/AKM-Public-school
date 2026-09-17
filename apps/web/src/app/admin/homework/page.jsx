'use client';

import InternalRecordManager from '@/components/admin/InternalRecordManager/InternalRecordManager';
import { useClassSections } from '@/hooks/useClassSections';
import { homeworkColumns, homeworkFields } from '@/constants/academicRecords';

/** Every class's homework, including what teachers set from their portal. */
export default function HomeworkPage() {
  const classOptions = useClassSections();

  return (
    <InternalRecordManager
      endpoint="/admin/homework"
      title="Homework"
      singular="homework item"
      description="Homework set by teachers and the office. Published items appear on the website's Homework page."
      columns={homeworkColumns}
      fields={homeworkFields({ classOptions })}
    />
  );
}
