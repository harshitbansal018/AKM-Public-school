'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '@/lib/adminApi';
import { API_URL } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { useToast } from '@/hooks/useToast';
import { formatLongDate, toTelHref } from '@/lib/format';
import { cn } from '@/lib/cn';
import AdminPage from '@/components/admin/AdminPage/AdminPage';
import DataTable from '@/components/admin/DataTable/DataTable';
import StatusPill from '@/components/admin/StatusPill/StatusPill';
import Modal from '@/components/ui/Modal/Modal';
import Textarea from '@/components/ui/Textarea/Textarea';
import Select from '@/components/ui/Select/Select';
import ConfirmDialog from '@/components/admin/ConfirmDialog/ConfirmDialog';
import { RowActions, RowButton } from '@/components/admin/RowActions/RowActions';
import styles from './enquiries.module.css';

const STATUSES = [
  { value: '', label: 'All' },
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'ADMITTED', label: 'Admitted' },
  { value: 'CLOSED', label: 'Closed' },
];

const CLASS_LABELS = {
  NURSERY_UKG: 'Nursery – UKG',
  CLASS_1_5: 'Class 1 – 5',
  CLASS_6_8: 'Class 6 – 8',
  CLASS_9_10: 'Class 9 – 10',
  CLASS_11_12: 'Class 11 – 12',
};

export default function EnquiriesAdminPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (status) params.set('status', status);
      const data = await adminApi.get(`/admin/enquiries?${params}`);
      setItems(data.items ?? []);
      setMeta(data.meta ?? null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (id, patch) => {
    setSaving(true);
    try {
      await adminApi.patch(`/admin/enquiries/${id}`, patch);
      toast.success('Enquiry updated');
      setOpen(null);
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  /**
   * The CSV route needs the bearer token, so it cannot be a plain <a href>.
   * Fetch it, then hand the browser a blob to save.
   */
  const exportCsv = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/enquiries/export`, {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      });
      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success('Downloaded');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <AdminPage
      title="Enquiries"
      description="Admission enquiries submitted through the website. Newest first."
      action={
        <button type="button" className="btn btn-outline btn-sm" onClick={exportCsv}>
          ⬇ Export CSV
        </button>
      }
    >
      <div className={styles.filters}>
        {STATUSES.map((option) => (
          <button
            key={option.value}
            type="button"
            className={cn(styles.filter, status === option.value && styles.active)}
            onClick={() => {
              setStatus(option.value);
              setPage(1);
            }}
          >
            {option.label}
          </button>
        ))}
      </div>

      <DataTable
        rows={items}
        loading={loading}
        error={error}
        emptyIcon="📥"
        emptyTitle="No enquiries"
        emptyDescription="Enquiries submitted through the contact form will appear here."
        columns={[
          {
            key: 'parentName',
            label: 'Parent',
            render: (r) => (
              <div>
                <b>{r.parentName}</b>
                <span className={styles.sub}>
                  <a href={toTelHref(r.phone)}>{r.phone}</a>
                </span>
              </div>
            ),
          },
          {
            key: 'studentName',
            label: 'Student',
            render: (r) => (
              <div>
                <span>{r.studentName || '—'}</span>
                <span className={styles.sub}>{CLASS_LABELS[r.classGroup] ?? r.classGroup ?? ''}</span>
              </div>
            ),
          },
          {
            key: 'createdAt',
            label: 'Received',
            nowrap: true,
            render: (r) => formatLongDate(r.createdAt),
          },
          {
            key: 'status',
            label: 'Status',
            width: '120px',
            render: (r) => <StatusPill value={r.status} />,
          },
        ]}
        actions={(row) => (
          <RowActions>
            <RowButton onClick={() => setOpen(row)}>Open</RowButton>
            <RowButton tone="danger" onClick={() => setDeleting(row)}>
              Delete
            </RowButton>
          </RowActions>
        )}
      />

      {meta && meta.totalPages > 1 ? (
        <div className={styles.pager}>
          <button type="button" className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            ← Previous
          </button>
          <span className={styles.pageInfo}>
            Page {meta.page} of {meta.totalPages} · {meta.total} enquiries
          </span>
          <button type="button" className="btn btn-outline btn-sm" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>
            Next →
          </button>
        </div>
      ) : null}

      <EnquiryDetail
        enquiry={open}
        busy={saving}
        onSave={save}
        onClose={() => setOpen(null)}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this enquiry?"
        message={`The enquiry from ${deleting?.parentName ?? ''} will be removed permanently.`}
        busy={saving}
        onConfirm={async () => {
          setSaving(true);
          try {
            await adminApi.delete(`/admin/enquiries/${deleting.id}`);
            toast.success('Deleted');
            await load();
          } catch (err) {
            toast.error(err.message);
          } finally {
            setSaving(false);
            setDeleting(null);
          }
        }}
        onCancel={() => setDeleting(null)}
      />
    </AdminPage>
  );
}

/** Full enquiry with the status and note the office can change. */
function EnquiryDetail({ enquiry, busy, onSave, onClose }) {
  const [status, setStatus] = useState('NEW');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!enquiry) return;
    setStatus(enquiry.status);
    setNote(enquiry.adminNote ?? '');
  }, [enquiry]);

  if (!enquiry) return null;

  return (
    <Modal open onClose={onClose} title={`Enquiry from ${enquiry.parentName}`}>
      <dl className={styles.details}>
        <div>
          <dt>Phone</dt>
          <dd>
            <a href={toTelHref(enquiry.phone)} className={styles.link}>
              {enquiry.phone}
            </a>
          </dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{enquiry.email || '—'}</dd>
        </div>
        <div>
          <dt>Student</dt>
          <dd>{enquiry.studentName || '—'}</dd>
        </div>
        <div>
          <dt>Class</dt>
          <dd>{CLASS_LABELS[enquiry.classGroup] ?? enquiry.classGroup ?? '—'}</dd>
        </div>
        <div>
          <dt>Received</dt>
          <dd>{formatLongDate(enquiry.createdAt)}</dd>
        </div>
        <div className={styles.wide}>
          <dt>Message</dt>
          <dd>{enquiry.message || '—'}</dd>
        </div>
      </dl>

      <Select
        id="status"
        label="Status"
        options={STATUSES.filter((s) => s.value)}
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      />

      <Textarea
        id="adminNote"
        label="Internal note"
        rows={3}
        placeholder="Called on 5 Oct — visiting Saturday."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className={styles.noteField}
      />

      <div className={styles.detailActions}>
        <a href={toTelHref(enquiry.phone)} className="btn btn-outline btn-sm">
          📞 Call
        </a>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          disabled={busy}
          onClick={() => onSave(enquiry.id, { status, adminNote: note })}
        >
          {busy ? 'Saving…' : 'Save'}
        </button>
      </div>
    </Modal>
  );
}
