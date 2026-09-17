'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { portalApi } from '@/lib/adminApi';
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
  // '/teacher/homework' → the teacher portal's client, '/admin/notices' → admin's.
  const api = useMemo(() => portalApi(endpoint.split('/')[1]), [endpoint]);
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
        const data = await api.get(`${endpoint}${query}`);
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
    [endpoint, api]
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
    (payload, query) => run(() => api.post(endpoint, payload), 'Created', query),
    [endpoint, api, run]
  );

  const update = useCallback(
    (id, payload, query) => run(() => api.put(`${endpoint}/${id}`, payload), 'Saved', query),
    [endpoint, api, run]
  );

  const patch = useCallback(
    (path, payload, message, query) =>
      run(() => api.patch(`${endpoint}${path}`, payload), message, query),
    [endpoint, api, run]
  );

  const remove = useCallback(
    (id, query) => run(() => api.delete(`${endpoint}/${id}`), 'Deleted', query),
    [endpoint, api, run]
  );

  return { items, meta, loading, saving, error, load, create, update, patch, remove, setItems };
}

export default useAdminResource;
