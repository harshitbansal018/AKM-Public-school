'use client';

import { useMemo, useState } from 'react';
import ChildPage from '@/components/parent/ChildPage/ChildPage';
import DataTable from '@/components/admin/DataTable/DataTable';
import Input from '@/components/ui/Input/Input';
import Select from '@/components/ui/Select/Select';
import { formatLongDate } from '@/lib/format';
import styles from '@/components/parent/ChildPage/ChildPage.module.css';

const NO_FILTER = { subject: '', from: '', to: '' };

/** Homework set for the child's class, filterable by subject and due date. */
export default function ParentHomeworkPage() {
  return (
    <ChildPage title="Homework" description="Homework set by the teachers for this class.">
      {(detail) => <HomeworkList homework={detail.homework} classGroup={detail.student.classGroup} />}
    </ChildPage>
  );
}

function HomeworkList({ homework, classGroup }) {
  const [filter, setFilter] = useState(NO_FILTER);
  const filtering = Boolean(filter.subject || filter.from || filter.to);

  const subjects = useMemo(() => [...new Set(homework.map((item) => item.subject))].sort(), [homework]);

  const rows = useMemo(
    () =>
      homework.filter((item) => {
        if (filter.subject && item.subject !== filter.subject) return false;
        const due = item.dueDate ? item.dueDate.slice(0, 10) : '';
        if (filter.from && (!due || due < filter.from)) return false;
        if (filter.to && (!due || due > filter.to)) return false;
        return true;
      }),
    [homework, filter]
  );

  return (
    <>
      <div className={styles.filters}>
        <Select
          id="subject"
          label="Subject"
          placeholder="All subjects"
          options={subjects.map((subject) => ({ value: subject, label: subject }))}
          value={filter.subject}
          onChange={(e) => setFilter({ ...filter, subject: e.target.value })}
        />
        <Input
          id="from"
          label="Due from"
          type="date"
          value={filter.from}
          onChange={(e) => setFilter({ ...filter, from: e.target.value })}
        />
        <Input
          id="to"
          label="Due until"
          type="date"
          value={filter.to}
          onChange={(e) => setFilter({ ...filter, to: e.target.value })}
        />
        {filtering ? (
          <button type="button" className={`btn btn-outline btn-sm ${styles.clear}`} onClick={() => setFilter(NO_FILTER)}>
            Clear filters
          </button>
        ) : null}
      </div>

      <p className={styles.count}>
        Showing {rows.length} of {homework.length} for {classGroup}
      </p>

      <DataTable
        rows={rows}
        emptyTitle={filtering ? 'No homework matches these filters' : 'No homework set yet'}
        emptyDescription={filtering ? undefined : 'Homework appears here as soon as a teacher sets it.'}
        columns={[
          {
            key: 'title',
            label: 'Assignment',
            render: (r) => (
              <>
                <b>{r.title}</b>
                {r.description ? <p className={styles.instructions}>{r.description}</p> : null}
              </>
            ),
          },
          { key: 'subject', label: 'Subject', nowrap: true },
          { key: 'dueDate', label: 'Due', nowrap: true, render: (r) => (r.dueDate ? formatLongDate(r.dueDate) : '—') },
          {
            key: 'attachmentPath',
            label: 'File',
            nowrap: true,
            render: (r) =>
              r.attachmentUrl ? (
                <a href={r.attachmentUrl} target="_blank" rel="noopener noreferrer" className={styles.attachment}>
                  {r.attachmentName ?? 'Download'}
                </a>
              ) : (
                '—'
              ),
          },
        ]}
      />
    </>
  );
}
