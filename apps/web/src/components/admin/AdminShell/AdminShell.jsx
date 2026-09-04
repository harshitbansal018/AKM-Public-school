'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { API_ENABLED } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/admin/Sidebar/Sidebar';
import styles from './AdminShell.module.css';

/**
 * Admin chrome + route guard. Anything under /admin except the login screen
 * requires a signed-in user; unauthenticated visitors are redirected.
 */
export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (loading || isLoginPage) return;
    if (!isAuthenticated) router.replace('/admin/login');
  }, [loading, isAuthenticated, isLoginPage, router]);

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
      <Sidebar open={menuOpen} onNavigate={() => setMenuOpen(false)} />

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
            ☰
          </button>
          <span className={styles.title}>Content Manager</span>
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
