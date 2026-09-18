'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { portalApi } from '@/lib/adminApi';
import { API_ENABLED } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { formatMoney } from '@/lib/format';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import { Loader } from '@/components/ui/Spinner/Spinner';
// Same layout language as the admin dashboard, so it shares that stylesheet.
import styles from '@/app/admin/dashboard/dashboard.module.css';

const parentApi = portalApi('parent');

/** The parent's linked children, one card each, leading to the child's page. */
export default function ParentDashboardPage() {
  const { user } = useAuth();
  const [children, setChildren] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!API_ENABLED) return;
    parentApi
      .get('/parent/children')
      .then(setChildren)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <h1 className={styles.heading}>
        Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
      </h1>
      <p className={styles.sub}>
        Choose a child to see their homework, results and fees. School rules are on the{' '}
        <Link href="/privacy-policy" target="_blank" rel="noopener noreferrer">
          School Policies page
        </Link>
        .
      </p>

      {error ? <p className={styles.error}>{error}</p> : null}
      {children === null && !error ? <Loader label="Loading your children…" /> : null}

      {children && children.length === 0 ? (
        <EmptyState
          title="No child is linked to this account yet"
          description="Please ask the school office to link your child's record to your login."
        />
      ) : null}

      <div className={styles.grid}>
        {(children ?? []).map((child) => (
          <section key={child.id} className={styles.panel}>
            <div className={styles.panelHead}>
              <h2>{child.name}</h2>
              <span>
                {child.classGroup}
                {child.rollNumber ? ` · Roll ${child.rollNumber}` : ''}
              </span>
            </div>
            <ul className={styles.enquiries}>
              <li>
                <div>
                  <b>{child.homeworkCount} homework</b>
                  <span>set for {child.classGroup}</span>
                </div>
                <Link href={`/parent/homework?child=${child.id}`}>View →</Link>
              </li>
              <li>
                <div>
                  <b>{child.resultCount} results</b>
                  <span>released by the school</span>
                </div>
                <Link href={`/parent/results?child=${child.id}`}>View →</Link>
              </li>
              <li>
                <div>
                  <b>{formatMoney(child.fees.outstanding)} outstanding</b>
                  <span>
                    {child.fees.pendingCount === 0
                      ? 'All fees paid'
                      : `${child.fees.pendingCount} fee${child.fees.pendingCount === 1 ? '' : 's'} pending`}
                  </span>
                </div>
                <Link href={`/parent/fees?child=${child.id}`}>View →</Link>
              </li>
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
