'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '@/lib/adminApi';
import { useToast } from '@/hooks/useToast';

/**
 * Loads and mutates one admin resource.
 *
 * Every screen needs the same four things — a list, a loading flag, an error,
 * and create/update/delete that refresh the list afterwards — so this holds
 * them once instead of in twelve near-identical pages.
 *
 * @param {string} endpoint  e.g. '/admin/facilities'
 */
export function useAdminResource(endpoint, { autoLoad = true } = {}) {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(
    async (query = '') => {
      setLoading(true);
      setError('');
      try {
        const data = await adminApi.get(`${endpoint}${query}`);
        // Endpoints return either a bare array or { items, meta }.
        if (Array.isArray(data)) {
          setItems(data);
          setMeta(null);
        } else {
          setItems(data?.items ?? []);
          setMeta(data?.meta ?? null);
        }
      } catch (err) {
        setError(err.message);
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [endpoint]
  );

  useEffect(() => {
    if (autoLoad) load();
  }, [autoLoad, load]);

  /** Wraps a mutation with the saving flag, a toast and a list refresh. */
  const run = useCallback(
    async (action, successMessage, query = '') => {
      setSaving(true);
      try {
        const result = await action();
        await load(query);
        if (successMessage) toast.success(successMessage);
        return result;
      } catch (err) {
        toast.error(err.message);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [load, toast]
  );

  const create = useCallback(
    (payload, query) => run(() => adminApi.post(endpoint, payload), 'Created', query),
    [endpoint, run]
  );

  const update = useCallback(
    (id, payload, query) => run(() => adminApi.put(`${endpoint}/${id}`, payload), 'Saved', query),
    [endpoint, run]
  );

  const patch = useCallback(
    (path, payload, message, query) =>
      run(() => adminApi.patch(`${endpoint}${path}`, payload), message, query),
    [endpoint, run]
  );

  const remove = useCallback(
    (id, query) => run(() => adminApi.delete(`${endpoint}/${id}`), 'Deleted', query),
    [endpoint, run]
  );

  return { items, meta, loading, saving, error, load, create, update, patch, remove, setItems };
}

export default useAdminResource;
