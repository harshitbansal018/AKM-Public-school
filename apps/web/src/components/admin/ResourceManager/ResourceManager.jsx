'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminPage from '@/components/admin/AdminPage/AdminPage';
import DataTable from '@/components/admin/DataTable/DataTable';
import ResourceForm from '@/components/admin/ResourceForm/ResourceForm';
import ConfirmDialog from '@/components/admin/ConfirmDialog/ConfirmDialog';
import { RowActions, RowButton } from '@/components/admin/RowActions/RowActions';
import ListToolbar, { applyListFilters } from '@/components/admin/ListToolbar/ListToolbar';
import Pagination from '@/components/ui/Pagination/Pagination';
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
 * @param {(row, { patch, post, saving }) => React.ReactNode} [extraRowActions]
 *        extra buttons per row; `patch(path, body, message)` / `post(...)` call the
 *        API and reload, `saving` is true while any request is in flight
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
  serverPagination = false,
}) {
  const { items, meta, loading, refreshing, saving, error, load, create, update, patch, post, remove } =
    useAdminResource(endpoint, { autoLoad: !serverPagination });
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch] = useState('');
  const [serverSearch, setServerSearch] = useState('');
  const [filterValues, setFilterValues] = useState({});
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!serverPagination) return undefined;
    const handle = setTimeout(() => setServerSearch(search.trim()), 300);
    return () => clearTimeout(handle);
  }, [search, serverPagination]);

  const query = useMemo(() => {
    if (!serverPagination) return '';
    const params = new URLSearchParams({ page: String(page), limit: '25' });
    if (serverSearch) params.set('q', serverSearch);
    Object.entries(filterValues).forEach(([name, value]) => {
      if (value !== '' && value !== undefined && value !== null) params.set(name, value);
    });
    return `?${params}`;
  }, [filterValues, page, serverPagination, serverSearch]);

  useEffect(() => {
    if (serverPagination) load(query);
  }, [load, query, serverPagination]);

  useEffect(() => {
    if (serverPagination && meta && page > meta.totalPages) setPage(meta.totalPages);
  }, [meta, page, serverPagination]);

  const visible = serverPagination
    ? filterRows(items)
    : filterRows(
        applyListFilters(items, { search, searchKeys: searchKeys ?? [], filters, values: filterValues })
      );
  const narrowed = serverPagination
    ? Boolean(serverSearch) || Object.values(filterValues).some(Boolean)
    : visible.length !== items.length;

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setFormOpen(true);
  };

  // On failure the error is rethrown: useAdminResource has shown the toast,
  // and ResourceForm stays open and marks the fields the API complained about.
  const handleSubmit = async (payload) => {
    if (editing) await update(editing.id, payload, query);
    else await create(payload, query);
    setFormOpen(false);
    setEditing(null);
  };

  const handleDelete = async () => {
    try {
      await remove(deleting.id, query);
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
        onSearch={
          searchKeys
            ? (value) => {
                setSearch(value);
                setPage(1);
              }
            : undefined
        }
        filters={filters}
        values={filterValues}
        onFilter={(name, value) => {
          setFilterValues((current) => ({ ...current, [name]: value }));
          setPage(1);
        }}
        summary={
          serverPagination && meta
            ? `${meta.total.toLocaleString('en-IN')} ${meta.total === 1 ? 'record' : 'records'}`
            : items.length
              ? `${visible.length} of ${items.length}`
              : undefined
        }
      />

      {typeof toolbar === 'function' ? toolbar(visible, items, meta) : toolbar}

      <DataTable
        columns={columns}
        rows={visible}
        loading={loading || (serverPagination && !meta && !error)}
        refreshing={refreshing}
        error={error}
        pageSize={serverPagination ? 0 : 25}
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
            {extraRowActions?.(row, {
              patch: (path, payload, message) => patch(path, payload, message, query),
              post: (path, payload, message) => post(path, payload, message, query),
              saving,
            })}
            <RowButton onClick={() => openEdit(row)}>Edit</RowButton>
            {canDelete(row) ? (
              <RowButton tone="danger" onClick={() => setDeleting(row)}>
                Delete
              </RowButton>
            ) : null}
          </RowActions>
        )}
      />

      {serverPagination && meta?.total > 0 ? (
        <Pagination
          compact
          page={meta.page}
          totalPages={meta.totalPages}
          onChange={setPage}
          summary={`Showing ${(meta.page - 1) * meta.limit + 1}–${Math.min(meta.page * meta.limit, meta.total)} of ${meta.total}`}
        />
      ) : null}

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
