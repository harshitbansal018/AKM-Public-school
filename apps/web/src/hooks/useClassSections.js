'use client';

import { useEffect, useState } from 'react';
import { portalApi } from '@/lib/adminApi';

/**
 * A list managed under Website content, as dropdown options.
 * @param {string} endpoint  e.g. '/admin/class-sections'
 */
function useManagedList(endpoint, portal = 'admin') {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    portalApi(portal)
      .get(endpoint)
      .then((list) => setOptions(list.map((name) => ({ value: name, label: name }))))
      .catch(() => setOptions([]));
  }, [endpoint, portal]);

  return options;
}

/**
 * The school's classes/sections (Website content → Classes & sections). Used by
 * every admin form that files something under a class, so they all offer
 * exactly the same list.
 */
export const useClassSections = () => useManagedList('/admin/class-sections');

/** The Policies page tabs (Website content → Policies page). */
export const usePolicyTabs = () => useManagedList('/admin/policy-tabs');

/**
 * The subjects taught (Website content → Classes & subjects). Offered wherever
 * a subject is chosen — homework and results — in both the admin panel and
 * the teacher portal.
 * @param {'admin'|'teacher'} [portal]
 */
export const useSubjects = (portal = 'admin') => useManagedList(`/${portal}/subjects`, portal);

export default useClassSections;
