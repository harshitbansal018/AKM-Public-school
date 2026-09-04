'use client';

import { useState } from 'react';
import { adminApi } from '@/lib/adminApi';
import { useToast } from '@/hooks/useToast';
import { useAdminResource } from '@/hooks/useAdminResource';
import { formatLongDate, toISODate } from '@/lib/format';
import AdminPage from '@/components/admin/AdminPage/AdminPage';
import DataTable from '@/components/admin/DataTable/DataTable';
import ResourceForm from '@/components/admin/ResourceForm/ResourceForm';
import ConfirmDialog from '@/components/admin/ConfirmDialog/ConfirmDialog';
import StatusPill from '@/components/admin/StatusPill/StatusPill';
import { RowActions, RowButton } from '@/components/admin/RowActions/RowActions';
import styles from './notices.module.css';

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'exam', label: 'Examination' },
  { value: 'admission', label: 'Admission' },
  { value: 'result', label: 'Result' },
  { value: 'event', label: 'Event' },
];

const FIELDS = [
  { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Annual Examination Date Sheet Released' },
  { name: 'noticeDate', label: 'Notice date', type: 'date', required: true, half: true },
  { name: 'category', label: 'Category', type: 'select', half: true, options: CATEGORIES },
  {
    name: 'excerpt',
    label: 'Short summary',
    type: 'textarea',
    rows: 2,
    help: 'One line shown on the notice board and the list page.',
  },
  {
    name: 'body',
    label: 'Full notice',
    type: 'textarea',
    rows: 8,
    help: 'Shown on the notice’s own page. Blank lines separate paragraphs.',
  },
  { name: 'isPinned', label: 'Pin to the top', type: 'checkbox' },
  { name: 'isPublished', label: 'Publish on the website', type: 'checkbox', default: true },
];

export default function NoticesAdminPage() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const query = `?page=${page}&limit=10`;

  const { items, meta, loading, saving, error, load, create, update, remove } =
    useAdminResource(`/admin/notices${query}`);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const refresh = () => load('');

  const handleSubmit = async (payload) => {
    try {
      if (editing) await update(editing.id, payload);
      else await create(payload);
      setFormOpen(false);
      setEditing(null);
    } catch {
      // message already shown; leave the form open so nothing is lost
    }
  };

  /** Publish toggle lives outside the form so it is one click from the list. */
  const togglePublished = async (row) => {
    setBusyId(row.id);
    try {
      await adminApi.patch(`/admin/notices/${row.id}/publish`, { isPublished: !row.isPublished });
      toast.success(row.isPublished ? 'Moved to drafts' : 'Published');
      await refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminPage
      title="Notices"
      description="News, examination dates, results and events. Published notices appear on the website immediately."
      action={
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          + Add notice
        </button>
      }
    >
      <DataTable
        rows={items}
        loading={loading}
        error={error}
        emptyIcon="📌"
        emptyTitle="No notices yet"
        emptyDescription="Add the first notice and it appears on the homepage board straight away."
        columns={[
          {
            key: 'title',
            label: 'Notice',
            render: (r) => (
              <div>
                <b className={styles.title}>{r.title}</b>
                {r.excerpt ? <span className={styles.excerpt}>{r.excerpt}</span> : null}
              </div>
            ),
          },
          {
            key: 'noticeDate',
            label: 'Date',
            nowrap: true,
            render: (r) => <time dateTime={toISODate(r.noticeDate)}>{formatLongDate(r.noticeDate)}</time>,
          },
          {
            key: 'category',
            label: 'Category',
            width: '120px',
            render: (r) => <StatusPill value="sky" label={r.category} />,
          },
          {
            key: 'isPublished',
            label: 'Status',
            width: '110px',
            render: (r) => (
              <StatusPill
                value={r.isPublished ? 'published' : 'draft'}
                label={r.isPublished ? 'Live' : 'Draft'}
              />
            ),
          },
        ]}
        actions={(row) => (
          <RowActions>
            <RowButton
              tone={row.isPublished ? 'default' : 'success'}
              disabled={busyId === row.id}
              onClick={() => togglePublished(row)}
            >
              {row.isPublished ? 'Unpublish' : 'Publish'}
            </RowButton>
            <RowButton
              onClick={() => {
                setEditing(row);
                setFormOpen(true);
              }}
            >
              Edit
            </RowButton>
            <RowButton tone="danger" onClick={() => setDeleting(row)}>
              Delete
            </RowButton>
          </RowActions>
        )}
      />

      {meta && meta.totalPages > 1 ? (
        <div className={styles.pager}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Previous
          </button>
          <span className={styles.pageInfo}>
            Page {meta.page} of {meta.totalPages} · {meta.total} notices
          </span>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      ) : null}

      <ResourceForm
        open={formOpen}
        title={editing ? 'Edit notice' : 'Add notice'}
        fields={FIELDS}
        initialValues={editing ?? { category: 'general', noticeDate: toISODate(new Date()) }}
        busy={saving}
        onSubmit={handleSubmit}
        onCancel={() => {
          setFormOpen(false);
          setEditing(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this notice?"
        message={`"${deleting?.title ?? ''}" will be removed from the website permanently.`}
        busy={saving}
        onConfirm={async () => {
          try {
            await remove(deleting.id);
          } finally {
            setDeleting(null);
          }
        }}
        onCancel={() => setDeleting(null)}
      />
    </AdminPage>
  );
}
