'use client';

import ChildPage from '@/components/parent/ChildPage/ChildPage';
import DataTable from '@/components/admin/DataTable/DataTable';
import { formatLongDate } from '@/lib/format';

/** Tests and examinations the school has published for this child. */
export default function ParentResultsPage() {
  return (
    <ChildPage title="Results" description="Marks and grades released by the school.">
      {(detail) => (
        <DataTable
          rows={detail.results}
          emptyTitle="No results released yet"
          emptyDescription="Results appear here once the teacher publishes them."
          columns={[
            { key: 'exam', label: 'Examination' },
            { key: 'score', label: 'Marks / grade', nowrap: true, render: (r) => <b>{r.score}</b> },
            { key: 'resultDate', label: 'Date', nowrap: true, render: (r) => (r.resultDate ? formatLongDate(r.resultDate) : '—') },
            { key: 'remarks', label: 'Remarks' },
          ]}
        />
      )}
    </ChildPage>
  );
}
