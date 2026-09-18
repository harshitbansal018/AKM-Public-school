'use client';

import MarksGrid from '@/components/admin/MarksGrid/MarksGrid';
import { useClassSections } from '@/hooks/useClassSections';

/** Marks for a whole class and examination in one sheet — any class. */
export default function AdminMarksEntryPage() {
  return <MarksGrid portal="admin" classOptions={useClassSections()} />;
}
