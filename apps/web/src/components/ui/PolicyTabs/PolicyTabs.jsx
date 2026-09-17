'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import PolicyCard from '@/components/ui/PolicyCard/PolicyCard';
import { tabSlug } from '@/constants/policies';
import styles from './PolicyTabs.module.css';

/**
 * The Policies page body: one tab per group, the policies of the chosen tab
 * below. The chosen tab goes in the URL hash (#attendance-leave-rules) so a
 * link can open the page on a particular tab.
 *
 * @param {{tab: string, items: object[]}[]} groups
 */
export default function PolicyTabs({ groups }) {
  const [active, setActive] = useState(groups[0]?.tab);

  // Open on the tab named in the hash, if there is one.
  useEffect(() => {
    const wanted = window.location.hash.replace('#', '');
    const match = groups.find((group) => tabSlug(group.tab) === wanted);
    if (match) setActive(match.tab);
  }, [groups]);

  const select = (tab) => {
    setActive(tab);
    window.history.replaceState(null, '', `#${tabSlug(tab)}`);
  };

  const current = groups.find((group) => group.tab === active) ?? groups[0];

  return (
    <div className={styles.wrap}>
      <div className={styles.tabs} role="tablist" aria-label="Policy categories">
        {groups.map((group) => {
          const selected = group.tab === current.tab;
          return (
            <button
              key={group.tab}
              type="button"
              role="tab"
              id={`tab-${tabSlug(group.tab)}`}
              aria-selected={selected}
              aria-controls={`panel-${tabSlug(group.tab)}`}
              className={cn(styles.tab, selected && styles.tabActive)}
              onClick={() => select(group.tab)}
            >
              {group.tab}
              <span className={styles.count}>{group.items.length}</span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`panel-${tabSlug(current.tab)}`}
        aria-labelledby={`tab-${tabSlug(current.tab)}`}
        className={styles.panel}
      >
        {current.items.map((policy) => (
          <PolicyCard key={policy.id} policy={policy} />
        ))}
      </div>
    </div>
  );
}
