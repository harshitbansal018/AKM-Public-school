'use client';
import InternalRecordManager from '@/components/admin/InternalRecordManager/InternalRecordManager';
export default function HomeworkPage() {
  return <InternalRecordManager endpoint="/admin/homework" title="Homework" singular="homework item" description="Create and track homework assigned to classes." columns={[{ key: 'title', label: 'Assignment' }, { key: 'classGroup', label: 'Class' }, { key: 'subject', label: 'Subject' }, { key: 'dueDate', label: 'Due date' }]} fields={[{ name: 'title', label: 'Assignment title', type: 'text', required: true }, { name: 'classGroup', label: 'Class / section', type: 'text', required: true, half: true }, { name: 'subject', label: 'Subject', type: 'text', required: true, half: true }, { name: 'dueDate', label: 'Due date', type: 'date', half: true }, { name: 'description', label: 'Instructions', type: 'textarea', rows: 5 }]} />;
}
