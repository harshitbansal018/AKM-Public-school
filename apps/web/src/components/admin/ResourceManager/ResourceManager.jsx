'use client';

import { useState } from 'react';
import AdminPage from '@/components/admin/AdminPage/AdminPage';
import DataTable from '@/components/admin/DataTable/DataTable';
import ResourceForm from '@/components/admin/ResourceForm/ResourceForm';
import ConfirmDialog from '@/components/admin/ConfirmDialog/ConfirmDialog';
import { RowActions, RowButton } from '@/components/admin/RowActions/RowActions';
import { useAdminResource } from '@/hooks/useAdminResource';

/**
 * A complete "list + add/edit form + delete" screen from one config object.
 *
 * Facilities, streams, stages, faculty, achievements, ticker lines and users
 * are all this same screen with different columns and fields, so they share
 * one implementation instead of seven copies that drift apart.
 */
export default function ResourceManager({
  endpoint,
  title,
  description,
  singular,
  columns,
  fields,
  emptyIcon = '📄',
  emptyDescription,
  extraRowActions,
  canDelete = () => true,
}) {
  const { items, loading, saving, error, create, update, remove } = useAdminResource(endpoint);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setFormOpen(true);
  };

  const handleSubmit = async (payload) => {
    try {
      if (editing) await update(editing.id, payload);
      else await create(payload);
      setFormOpen(false);
      setEditing(null);
    } catch {
      // useAdminResource already surfaced the message; keep the form open so
      // the person does not lose what they typed.
    }
  };

  const handleDelete = async () => {
    try {
      await remove(deleting.id);
      setDeleting(null);
    } catch {
      setDeleting(null);
    }
  };

  return (
    <AdminPage
      title={title}
      description={description}
      action={
        <button type="button" className="btn btn-primary btn-sm" onClick={openCreate}>
          + Add {singular}
        </button>
      }
    >
      <DataTable
        columns={columns}
        rows={items}
        loading={loading}
        error={error}
        emptyIcon={emptyIcon}
        emptyTitle={`No ${title.toLowerCase()} yet`}
        emptyDescription={emptyDescription}
        emptyAction={
          <button type="button" className="btn btn-primary btn-sm" onClick={openCreate}>
            + Add {singular}
          </button>
        }
        actions={(row) => (
          <RowActions>
            {extraRowActions?.(row)}
            <RowButton onClick={() => openEdit(row)}>Edit</RowButton>
            {canDelete(row) ? (
              <RowButton tone="danger" onClick={() => setDeleting(row)}>
                Delete
              </RowButton>
            ) : null}
          </RowActions>
        )}
      />

      <ResourceForm
        open={formOpen}
        title={editing ? `Edit ${singular}` : `Add ${singular}`}
        fields={fields}
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
        title={`Delete this ${singular.toLowerCase()}?`}
        message="This cannot be undone, and it disappears from the public website immediately."
        busy={saving}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </AdminPage>
  );
}
