'use client';

import InternalRecordManager from '@/components/admin/InternalRecordManager/InternalRecordManager';
import { useAuth } from '@/context/AuthContext';
import { teacherHomeworkColumns, homeworkFields } from '@/constants/academicRecords';

/** Select class → subject → instructions → due date → save. It is live at once. */
export default function TeacherHomeworkPage() {
  const { user } = useAuth();

  return (
    <InternalRecordManager
      endpoint="/teacher/homework"
      title="Homework"
      singular="homework item"
      description="Set homework for your classes. Saved homework is visible straight away to parents of that class and on the website's Homework page."
      emptyDescription="Homework you set for your assigned classes will be listed here."
      columns={teacherHomeworkColumns}
      fields={homeworkFields({
        classOptions: (user?.assignedClasses ?? []).map((name) => ({ value: name, label: name })),
        publishControl: false,
      })}
    />
  );
}
