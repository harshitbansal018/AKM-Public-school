'use client';

import { useRef, useState } from 'react';
import { adminApi } from '@/lib/adminApi';
import { API_URL } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { useToast } from '@/hooks/useToast';
import { useAdminResource } from '@/hooks/useAdminResource';
import { formatFileSize, formatLongDate } from '@/lib/format';
import { DOCUMENT_ACCEPT, DOCUMENT_RULE } from '@/constants/uploads';
import AdminPage from '@/components/admin/AdminPage/AdminPage';
import DataTable from '@/components/admin/DataTable/DataTable';
import ConfirmDialog from '@/components/admin/ConfirmDialog/ConfirmDialog';
import StatusPill from '@/components/admin/StatusPill/StatusPill';
import Modal from '@/components/ui/Modal/Modal';
import Input from '@/components/ui/Input/Input';
import Select from '@/components/ui/Select/Select';
import { RowActions, RowButton } from '@/components/admin/RowActions/RowActions';
import styles from './downloads.module.css';

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'datesheet', label: 'Date sheet' },
  { value: 'syllabus', label: 'Syllabus' },
  { value: 'form', label: 'Form' },
  { value: 'result', label: 'Result' },
];

export default function DownloadsAdminPage() {
  const { items, loading, saving, error, load, remove } = useAdminResource('/admin/downloads');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);

  return (
    <AdminPage
      title="Downloads"
      description="Date sheets, forms and documents parents can download from the website."
      action={
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setUploadOpen(true)}>
          + Upload file
        </button>
      }
    >
      <DataTable
        rows={items}
        loading={loading}
        error={error}
        emptyIcon="📄"
        emptyTitle="No downloads yet"
        emptyDescription="Upload a date sheet or admission form and it appears on the Downloads page."
        emptyAction={
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setUploadOpen(true)}>
            + Upload file
          </button>
        }
        columns={[
          { key: 'title', label: 'Title' },
          {
            key: 'category',
            label: 'Category',
            width: '130px',
            render: (r) => <StatusPill value="sky" label={r.category} />,
          },
          {
            key: 'fileSize',
            label: 'Size',
            width: '100px',
            render: (r) => formatFileSize(r.fileSize) || '—',
          },
          { key: 'downloadCount', label: 'Downloads', width: '110px' },
          {
            key: 'createdAt',
            label: 'Added',
            nowrap: true,
            render: (r) => formatLongDate(r.createdAt),
          },
          {
            key: 'isPublic',
            label: 'Status',
            width: '110px',
            render: (r) => (
              <StatusPill value={r.isPublic ? 'published' : 'draft'} label={r.isPublic ? 'Live' : 'Hidden'} />
            ),
          },
        ]}
        actions={(row) => (
          <RowActions>
            <a
              className={styles.viewLink}
              href={`${API_URL.replace('/api/v1', '/api/v1')}/downloads/${row.id}/file`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View
            </a>
            <RowButton tone="danger" onClick={() => setDeleting(row)}>
              Delete
            </RowButton>
          </RowActions>
        )}
      />

      <UploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onDone={() => {
          setUploadOpen(false);
          load();
        }}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this download?"
        message={`"${deleting?.title ?? ''}" and its file will be removed permanently.`}
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

function UploadDialog({ open, onClose, onDone }) {
  const toast = useToast();
  const fileInput = useRef(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('general');
  const [fileName, setFileName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    const file = fileInput.current?.files?.[0];

    if (!title.trim()) return setError('Give the file a title');
    if (!file) return setError('Choose a file to upload');
    setError('');

    const form = new FormData();
    form.append('file', file);
    form.append('title', title.trim());
    form.append('category', category);
    form.append('isPublic', 'true');

    setBusy(true);
    try {
      const res = await fetch(`${API_URL}/admin/downloads`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getAccessToken()}` },
        body: form,
      });
      const payload = await res.json();
      if (!res.ok || payload.success === false) throw new Error(payload.message || 'Upload failed');

      toast.success('File uploaded');
      setTitle('');
      setFileName('');
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={busy ? () => {} : onClose} title="Upload a download">
      <form onSubmit={submit} noValidate>
        <Input
          id="dlTitle"
          label="Title"
          placeholder="Annual Examination Date Sheet 2026"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Select
          id="dlCategory"
          label="Category"
          options={CATEGORIES}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={styles.field}
        />

        <div className={styles.field}>
          <span className={styles.fileLabel}>File</span>
          <input
            ref={fileInput}
            id="dlFile"
            type="file"
            accept={DOCUMENT_ACCEPT}
            className={styles.fileInput}
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')}
          />
          <label htmlFor="dlFile" className={styles.filePicker}>
            {fileName || 'Choose a file…'}
          </label>
          <small className={styles.hint}>{DOCUMENT_RULE}</small>
        </div>

        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}

        <div className={styles.actions}>
          <button type="button" className="btn btn-outline btn-sm" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>
            {busy ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
