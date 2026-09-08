'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { adminApi } from '@/lib/adminApi';
import { API_URL } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { useToast } from '@/hooks/useToast';
import { useAdminResource } from '@/hooks/useAdminResource';
import { formatLongDate } from '@/lib/format';
import { IMAGE_TYPES, IMAGE_ACCEPT, IMAGE_RULE, MAX_IMAGE_MB, MAX_IMAGE_BYTES } from '@/constants/uploads';
import AdminPage from '@/components/admin/AdminPage/AdminPage';
import DataTable from '@/components/admin/DataTable/DataTable';
import ResourceForm from '@/components/admin/ResourceForm/ResourceForm';
import ConfirmDialog from '@/components/admin/ConfirmDialog/ConfirmDialog';
import StatusPill from '@/components/admin/StatusPill/StatusPill';
import Modal from '@/components/ui/Modal/Modal';
import { RowActions, RowButton } from '@/components/admin/RowActions/RowActions';
import styles from './gallery.module.css';

const FIELDS = [
  { name: 'title', label: 'Album title', type: 'text', required: true, placeholder: 'Sports Day 2026' },
  { name: 'description', label: 'Description', type: 'textarea', rows: 2 },
  { name: 'eventDate', label: 'Event date', type: 'date', half: true },
  { name: 'sortOrder', label: 'Order', type: 'number', half: true },
  { name: 'isPublished', label: 'Show on the website', type: 'checkbox', default: true },
];

export default function GalleryAdminPage() {
  const { items, loading, saving, error, load, create, update, remove } =
    useAdminResource('/admin/gallery');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [managing, setManaging] = useState(null);

  const handleSubmit = async (payload) => {
    try {
      if (editing) await update(editing.id, payload);
      else await create(payload);
      setFormOpen(false);
      setEditing(null);
    } catch {
      /* toast already shown */
    }
  };

  return (
    <AdminPage
      title="Gallery"
      description="Photo albums shown on the Gallery page. Create an album, then add photos to it."
      action={
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          + Add album
        </button>
      }
    >
      <DataTable
        rows={items}
        loading={loading}
        error={error}
        emptyIcon="🖼️"
        emptyTitle="No albums yet"
        emptyDescription="Create an album such as “Sports Day”, then upload photos into it."
        columns={[
          {
            key: 'cover',
            label: '',
            width: '76px',
            render: (r) =>
              r.coverImage ? (
                <Image src={r.coverImage} alt="" width={56} height={42} className={styles.thumb} />
              ) : (
                <span className={styles.noThumb}>—</span>
              ),
          },
          {
            key: 'title',
            label: 'Album',
            render: (r) => (
              <div>
                <b>{r.title}</b>
                {r.description ? <span className={styles.sub}>{r.description}</span> : null}
              </div>
            ),
          },
          {
            key: 'imageCount',
            label: 'Photos',
            width: '90px',
            render: (r) => `${r.imageCount ?? 0}`,
          },
          {
            key: 'eventDate',
            label: 'Event date',
            nowrap: true,
            render: (r) => (r.eventDate ? formatLongDate(r.eventDate) : '—'),
          },
          {
            key: 'isPublished',
            label: 'Status',
            width: '110px',
            render: (r) => (
              <StatusPill value={r.isPublished ? 'published' : 'draft'} label={r.isPublished ? 'Live' : 'Hidden'} />
            ),
          },
        ]}
        actions={(row) => (
          <RowActions>
            <RowButton tone="success" onClick={() => setManaging(row)}>
              Photos
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

      <ResourceForm
        open={formOpen}
        title={editing ? 'Edit album' : 'Add album'}
        fields={FIELDS}
        initialValues={editing ?? {}}
        busy={saving}
        onSubmit={handleSubmit}
        onCancel={() => {
          setFormOpen(false);
          setEditing(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this album?"
        message={`"${deleting?.title ?? ''}" and all ${deleting?.imageCount ?? 0} of its photos will be deleted permanently.`}
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

      {managing ? (
        <PhotoManager
          albumId={managing.id}
          albumTitle={managing.title}
          onClose={() => {
            setManaging(null);
            load();
          }}
        />
      ) : null}
    </AdminPage>
  );
}

/** Upload, view and delete the photos inside one album. */
function PhotoManager({ albumId, albumTitle, onClose }) {
  const toast = useToast();
  const fileInput = useRef(null);
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [settingCover, setSettingCover] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      setAlbum(await adminApi.get(`/admin/gallery/${albumId}`));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [albumId]);

  const upload = async (event) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    // Reject the whole batch rather than letting the API fail partway and
    // leave the album with some photos uploaded and some not.
    const wrongType = files.find((file) => !IMAGE_TYPES.includes(file.type));
    if (wrongType) {
      toast.error(`"${wrongType.name}" is not a JPG or PNG`);
      if (fileInput.current) fileInput.current.value = '';
      return;
    }

    const tooBig = files.find((file) => file.size > MAX_IMAGE_BYTES);
    if (tooBig) {
      toast.error(
        `"${tooBig.name}" is ${(tooBig.size / 1024 / 1024).toFixed(1)} MB — the limit is ${MAX_IMAGE_MB} MB`
      );
      if (fileInput.current) fileInput.current.value = '';
      return;
    }

    const form = new FormData();
    files.forEach((file) => form.append('files', file));

    setUploading(true);
    try {
      // multipart — the browser must set its own Content-Type boundary,
      // so this goes through fetch directly rather than adminApi.post.
      const res = await fetch(`${API_URL}/admin/gallery/${albumId}/images`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getAccessToken()}` },
        body: form,
      });
      const payload = await res.json();
      if (!res.ok || payload.success === false) throw new Error(payload.message || 'Upload failed');

      toast.success(`${files.length} photo(s) uploaded`);
      setAlbum(payload.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  /** The API returns full URLs; the cover is stored as a relative path. */
  const toStoredPath = (url) => String(url ?? '').split('/uploads/').pop() ?? '';

  const isCover = (image) =>
    Boolean(album?.coverImage) && toStoredPath(album.coverImage) === toStoredPath(image.imagePath);

  const setCover = async (image) => {
    setSettingCover(image.id);
    try {
      const updated = await adminApi.put(`/admin/gallery/${albumId}`, {
        coverImage: toStoredPath(image.imagePath),
      });
      setAlbum((current) => ({ ...current, coverImage: updated.coverImage }));
      toast.success('Cover updated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSettingCover(null);
    }
  };

  const deletePhoto = async (imageId) => {
    setRemoving(imageId);
    try {
      await adminApi.delete(`/admin/gallery/images/${imageId}`);
      setAlbum((current) => ({
        ...current,
        images: current.images.filter((image) => image.id !== imageId),
      }));
      toast.success('Photo deleted');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRemoving(null);
    }
  };

  const images = album?.images ?? [];

  return (
    <Modal open onClose={onClose} title={`Photos — ${albumTitle}`} className={styles.photoModal}>
      <div className={styles.uploadRow}>
        <input
          ref={fileInput}
          type="file"
          accept={IMAGE_ACCEPT}
          multiple
          onChange={upload}
          disabled={uploading}
          className={styles.fileInput}
          id="album-photos"
        />
        <label htmlFor="album-photos" className="btn btn-primary btn-sm">
          {uploading ? 'Uploading…' : '+ Add photos'}
        </label>
        <span className={styles.uploadHint}>{IMAGE_RULE} each · pick several at once</span>
      </div>

      {loading ? (
        <p className={styles.loading}>Loading photos…</p>
      ) : images.length === 0 ? (
        <p className={styles.loading}>No photos in this album yet. The first one becomes the cover.</p>
      ) : (
        <ul className={styles.photoGrid}>
          {images.map((image) => (
            <li key={image.id} className={styles.photo}>
              <Image src={image.imagePath} alt={image.caption || ''} width={160} height={120} className={styles.photoImg} />

              {isCover(image) ? (
                <span className={styles.coverBadge}>Cover</span>
              ) : (
                <button
                  type="button"
                  className={styles.makeCover}
                  onClick={() => setCover(image)}
                  disabled={settingCover === image.id}
                >
                  {settingCover === image.id ? '…' : 'Make cover'}
                </button>
              )}

              <button
                type="button"
                className={styles.photoDelete}
                onClick={() => deletePhoto(image.id)}
                disabled={removing === image.id}
                aria-label="Delete photo"
              >
                {removing === image.id ? '…' : '✕'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
