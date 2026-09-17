'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { portalApi } from '@/lib/adminApi';
import AdminPage from '@/components/admin/AdminPage/AdminPage';
import DataTable from '@/components/admin/DataTable/DataTable';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import dashboard from '@/app/admin/dashboard/dashboard.module.css';
import styles from './ChildPage.module.css';

const parentApi = portalApi('parent');
const LAST_CHILD_KEY = 'akm.parent.child';

/**
 * Frame for the Homework / Results / Fees pages of the parent portal.
 *
 * Works out which child is being viewed — `?child=ID` in the URL, else the
 * child looked at last, else the first — shows a switcher when there is more
 * than one, loads that child's records and hands them to `children(detail)`.
 * The choice is remembered, so moving from Homework to Fees stays on the same
 * child.
 */
export default function ChildPage(props) {
  // useSearchParams needs a Suspense boundary above it when the page is prerendered.
  return (
    <Suspense fallback={<AdminPage title={props.title} description={props.description} />}>
      <ChildPageInner {...props} />
    </Suspense>
  );
}

function ChildPageInner({ title, description, children: render }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const requested = params.get('child');

  const [kids, setKids] = useState(null);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    parentApi
      .get('/parent/children')
      .then(setKids)
      .catch((err) => setError(err.message));
  }, []);

  const selected = useMemo(() => {
    if (!kids?.length) return null;
    const byId = (id) => kids.find((kid) => String(kid.id) === String(id));
    let remembered = null;
    try {
      remembered = window.sessionStorage.getItem(LAST_CHILD_KEY);
    } catch {
      // private browsing — fall through to the first child
    }
    return byId(requested) ?? byId(remembered) ?? kids[0];
  }, [kids, requested]);

  useEffect(() => {
    if (!selected) return;
    try {
      window.sessionStorage.setItem(LAST_CHILD_KEY, String(selected.id));
    } catch {
      // ignore
    }
    setDetail(null);
    parentApi
      .get(`/parent/children/${selected.id}`)
      .then(setDetail)
      .catch((err) => setError(err.message));
  }, [selected]);

  const heading = selected ? `${title} — ${selected.name}` : title;
  const sub = selected
    ? `${selected.classGroup}${selected.rollNumber ? ` · Roll no. ${selected.rollNumber}` : ''}. ${description}`
    : description;

  return (
    <AdminPage title={heading} description={sub}>
      {error ? <p className={dashboard.error}>{error}</p> : null}

      {kids && kids.length === 0 ? (
        <EmptyState
          title="No child is linked to this account yet"
          description="Please ask the school office to link your child's record to your login."
        />
      ) : null}

      {kids && kids.length > 1 ? (
        <nav className={styles.switcher} aria-label="Your children">
          {kids.map((kid) => (
            <Link
              key={kid.id}
              href={`${pathname}?child=${kid.id}`}
              className={`btn btn-sm ${kid.id === selected?.id ? 'btn-primary' : 'btn-outline'}`}
              aria-current={kid.id === selected?.id ? 'page' : undefined}
            >
              {kid.name} · {kid.classGroup}
            </Link>
          ))}
        </nav>
      ) : null}

      {selected && !detail && !error ? <DataTable rows={[]} columns={[]} loading /> : null}
      {detail ? render(detail) : null}
    </AdminPage>
  );
}
