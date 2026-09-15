'use client';
import InternalRecordManager from '@/components/admin/InternalRecordManager/InternalRecordManager';
export default function StudentsPage() {
  return <InternalRecordManager endpoint="/admin/students" title="Students" singular="student" description="Maintain the school’s internal student register." columns={[{ key: 'name', label: 'Student' }, { key: 'classGroup', label: 'Class' }, { key: 'rollNumber', label: 'Roll no.' }, { key: 'guardianName', label: 'Parent / guardian' }, { key: 'phone', label: 'Phone' }]} fields={[{ name: 'name', label: 'Student name', type: 'text', required: true }, { name: 'classGroup', label: 'Class / section', type: 'text', required: true, half: true }, { name: 'rollNumber', label: 'Roll number', type: 'text', half: true }, { name: 'guardianName', label: 'Parent / guardian', type: 'text', required: true }, { name: 'phone', label: 'Phone', type: 'text' }, { name: 'address', label: 'Address', type: 'textarea', rows: 3 }]} />;
}
