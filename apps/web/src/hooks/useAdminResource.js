'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const loadedOnce = useRef(false);
  const requestNumber = useRef(0);

  const load = useCallback(
    async (query = '') => {
      const request = ++requestNumber.current;
      if (loadedOnce.current) setRefreshing(true);
      else setLoading(true);
      setError('');
      try {
        const data = await api.get(`${endpoint}${query}`);
        if (request !== requestNumber.current) return;
        // Endpoints return either a bare array or { items, meta }.
        if (Array.isArray(data)) {
          setItems(data);
          setMeta(null);
        } else {
          setItems(data?.items ?? []);
          setMeta(data?.meta ?? null);
        }
      } catch (err) {
        if (request !== requestNumber.current) return;
        setError(err.message);
      } finally {
        if (request === requestNumber.current) {
          loadedOnce.current = true;
          setLoading(false);
          setRefreshing(false);
        }
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

  /** A POST action on one row (send a reminder, say) — same toast + refresh as patch. */
  const post = useCallback(
    (path, payload, message, query) =>
      run(() => api.post(`${endpoint}${path}`, payload), message, query),
    [endpoint, api, run]
  );

  const remove = useCallback(
    (id, query) => run(() => api.delete(`${endpoint}/${id}`), 'Deleted', query),
    [endpoint, api, run]
  );

  return { items, meta, loading, refreshing, saving, error, load, create, update, patch, post, remove, setItems };
}

export default useAdminResource;
