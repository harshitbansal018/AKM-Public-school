'use client';

import MarksGrid from '@/components/admin/MarksGrid/MarksGrid';
import { useAuth } from '@/context/AuthContext';

/** Marks for a whole class and examination in one sheet — assigned classes only. */
export default function TeacherMarksEntryPage() {
  const { user } = useAuth();
  return (
    <MarksGrid
      portal="teacher"
      classOptions={(user?.assignedClasses ?? []).map((name) => ({ value: name, label: name }))}
    />
  );
}
