'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { API_ENABLED } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/admin/Sidebar/Sidebar';
import LineIcon from '@/components/ui/LineIcon/LineIcon';
import styles from './AdminShell.module.css';

/**
 * Portal chrome + route guard, shared by the admin panel and the teacher
 * portal. Anything under /<portal> except the login screen requires a
 * signed-in user of that portal; everyone else is redirected to its login.
 *
 * @param {object} props
 * @param {object[]} props.nav      sidebar sections (see constants/adminNav.js)
 * @param {{name: string, tagline: string}} props.brand
 * @param {string} props.title      topbar heading
 */
export default function AdminShell({ nav, brand, title, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { portal, isAuthenticated, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const loginPath = `/${portal}/login`;
  const isLoginPage = pathname === loginPath;

  useEffect(() => {
    if (loading || isLoginPage) return;
    if (!isAuthenticated) router.replace(loginPath);
  }, [loading, isAuthenticated, isLoginPage, loginPath, router]);

  useEffect(() => setMenuOpen(false), [pathname]);

  // The login screen renders bare — no sidebar, no guard.
  if (isLoginPage) return children;

  if (loading) {
    return (
      <div className={styles.center}>
        <span className={styles.spinner} aria-label="Loading" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.center}>
        <p>Redirecting to sign in…</p>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      <Sidebar nav={nav} brand={brand} open={menuOpen} onNavigate={() => setMenuOpen(false)} />

      {menuOpen ? (
        <button
          type="button"
          className={styles.scrim}
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
        />
      ) : null}

      <div className={styles.main}>
        <header className={styles.topbar}>
          <button
            type="button"
            className={styles.burger}
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle menu"
          >
            <LineIcon name="menu" size={24} strokeWidth={2} />
          </button>
          <span className={styles.title}>{title}</span>
        </header>

        {!API_ENABLED ? (
          <div className={styles.banner}>
            <b>Backend not connected.</b> Set <code>NEXT_PUBLIC_API_URL</code> in{' '}
            <code>apps/web/.env.local</code> once the Express API is running.
          </div>
        ) : null}

        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
