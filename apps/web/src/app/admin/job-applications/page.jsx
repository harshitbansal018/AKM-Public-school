'use client';

import { useState } from 'react';
import Link from 'next/link';
import InternalRecordManager from '@/components/admin/InternalRecordManager/InternalRecordManager';
import StatusPill from '@/components/admin/StatusPill/StatusPill';
import { RowButton } from '@/components/admin/RowActions/RowActions';
import Spinner from '@/components/ui/Spinner/Spinner';
import { adminApi } from '@/lib/adminApi';
import { useToast } from '@/hooks/useToast';
import { formatLongDate } from '@/lib/format';
import { applicationStatuses, statusLabel, statusTone } from '@/constants/jobApplications';

/**
 * Applications from the website's Careers page. Move each one through the
 * statuses, download the CV, and open a print-friendly sheet for interviews.
 */
export default function JobApplicationsPage() {
  const toast = useToast();
  const [downloading, setDownloading] = useState(null);

  const downloadCv = async (row) => {
    setDownloading(row.id);
    try {
      await adminApi.download(`/admin/job-applications/${row.id}/resume`, row.resumeName || `${row.reference}-cv`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <InternalRecordManager
      endpoint="/admin/job-applications"
      title="Job Applications"
      searchKeys={['name', 'reference', 'position', 'subject', 'phone', 'email']}
      searchPlaceholder="Search by name, reference, position…"
      filters={[
        {
          name: 'status',
          label: 'Status',
          placeholder: 'Any status',
          options: applicationStatuses.map(({ value, label }) => ({ value, label })),
        },
      ]}
      singular="application"
      description="Applications from the Careers page, newest first. Open one to view and print it; edit to change its status or add interview notes."
      emptyDescription="Applications sent from the website's Careers page will appear here."
      columns={[
        { key: 'reference', label: 'Ref.', nowrap: true, render: (r) => <b>{r.reference ?? '—'}</b> },
        { key: 'name', label: 'Applicant' },
        {
          key: 'position',
          label: 'Position',
          render: (r) => (
            <>
              {r.position}
              {r.subject ? <span style={{ color: 'var(--muted)' }}> · {r.subject}</span> : null}
            </>
          ),
        },
        { key: 'experience', label: 'Experience', nowrap: true },
        { key: 'createdAt', label: 'Received', nowrap: true, render: (r) => formatLongDate(r.createdAt) },
        {
          key: 'status',
          label: 'Status',
          width: '120px',
          render: (r) => <StatusPill value={statusTone(r.status)} label={statusLabel(r.status)} />,
        },
      ]}
      extraRowActions={(row) => (
        <>
          <Link href={`/admin/job-applications/${row.id}`} className="btn btn-outline btn-sm">
            View / Print
          </Link>
          {row.resumePath ? (
            <RowButton disabled={downloading === row.id} onClick={() => downloadCv(row)}>
              {downloading === row.id ? <Spinner size="xs" /> : null} CV
            </RowButton>
          ) : null}
        </>
      )}
      fields={[
        { name: 'name', label: 'Applicant name', type: 'text', required: true, half: true },
        { name: 'phone', label: 'Phone', type: 'text', half: true },
        { name: 'email', label: 'Email', type: 'text', half: true },
        { name: 'address', label: 'City / town', type: 'text', half: true },
        { name: 'position', label: 'Position applied for', type: 'text', required: true, half: true },
        { name: 'subject', label: 'Subject', type: 'text', half: true },
        { name: 'qualification', label: 'Highest qualification', type: 'text', half: true },
        { name: 'experience', label: 'Experience', type: 'text', half: true },
        { name: 'currentSchool', label: 'Current / last school', type: 'text' },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          half: true,
          options: applicationStatuses.map(({ value, label }) => ({ value, label })),
        },
        { name: 'notes', label: "Applicant's message", type: 'textarea', rows: 3 },
        { name: 'adminNote', label: 'Office notes / interview remarks', type: 'textarea', rows: 4, help: 'Internal — the applicant never sees this.' },
      ]}
    />
  );
}
