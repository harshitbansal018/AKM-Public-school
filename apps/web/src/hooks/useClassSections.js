'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/adminApi';

/**
 * A list managed under Website content, as dropdown options.
 * @param {string} endpoint  e.g. '/admin/class-sections'
 */
function useManagedList(endpoint) {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    adminApi
      .get(endpoint)
      .then((list) => setOptions(list.map((name) => ({ value: name, label: name }))))
      .catch(() => setOptions([]));
  }, [endpoint]);

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

export default useClassSections;
