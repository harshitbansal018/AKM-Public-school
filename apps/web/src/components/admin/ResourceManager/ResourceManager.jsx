'use client';

import { useState } from 'react';
import AdminPage from '@/components/admin/AdminPage/AdminPage';
import DataTable from '@/components/admin/DataTable/DataTable';
import ResourceForm from '@/components/admin/ResourceForm/ResourceForm';
import ConfirmDialog from '@/components/admin/ConfirmDialog/ConfirmDialog';
import { RowActions, RowButton } from '@/components/admin/RowActions/RowActions';
import ListToolbar, { applyListFilters } from '@/components/admin/ListToolbar/ListToolbar';
import { useAdminResource } from '@/hooks/useAdminResource';

/**
 * A complete "list + add/edit form + delete" screen from one config object.
 *
 * Facilities, streams, stages, faculty, achievements, ticker lines and users
 * are all this same screen with different columns and fields, so they share
 * one implementation instead of seven copies that drift apart.
 *
 * @param {string[]} [searchKeys]  row fields a search box matches against; omit for no search box
 * @param {{name, label, options, match?}[]} [filters]  dropdown filters above the table
 * @param {React.ReactNode | ((visibleRows, allItems) => React.ReactNode)} [toolbar]
 *        rendered above the table — totals and the like; gets the rows after search/filters
 * @param {(items) => items} [filterRows]  extra narrowing on top of the built-in filters
 * @param {React.ReactNode} [extraActions]  rendered beside the "+ Add" button in the page header
 * @param {(row, { patch, saving }) => React.ReactNode} [extraRowActions]
 *        extra buttons per row; `patch(path, body, message)` calls the API and reloads,
 *        `saving` is true while any request is in flight
 */
export default function ResourceManager({
  endpoint,
  title,
  description,
  singular,
  columns,
  fields,
  emptyDescription,
  searchKeys,
  searchPlaceholder,
  filters = [],
  toolbar,
  filterRows = (rows) => rows,
  extraActions,
  extraRowActions,
  canDelete = () => true,
}) {
  const { items, loading, saving, error, create, update, patch, remove } = useAdminResource(endpoint);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState({});

  const visible = filterRows(
    applyListFilters(items, { search, searchKeys: searchKeys ?? [], filters, values: filterValues })
  );
  const narrowed = visible.length !== items.length;

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
        <>
          {extraActions}
          <button type="button" className="btn btn-primary btn-sm" onClick={openCreate}>
            + Add {singular}
          </button>
        </>
      }
    >
      <ListToolbar
        searchPlaceholder={searchPlaceholder}
        search={search}
        onSearch={searchKeys ? setSearch : undefined}
        filters={filters}
        values={filterValues}
        onFilter={(name, value) => setFilterValues((current) => ({ ...current, [name]: value }))}
        summary={items.length ? `${visible.length} of ${items.length}` : undefined}
      />

      {typeof toolbar === 'function' ? toolbar(visible, items) : toolbar}

      <DataTable
        columns={columns}
        rows={visible}
        loading={loading}
        error={error}
        emptyTitle={narrowed ? `No ${title.toLowerCase()} match` : `No ${title.toLowerCase()} yet`}
        emptyDescription={narrowed ? 'Try clearing the search or filters.' : emptyDescription}
        emptyAction={
          narrowed ? null : (
            <button type="button" className="btn btn-primary btn-sm" onClick={openCreate}>
              + Add {singular}
            </button>
          )
        }
        actions={(row) => (
          <RowActions>
            {extraRowActions?.(row, { patch, saving })}
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
