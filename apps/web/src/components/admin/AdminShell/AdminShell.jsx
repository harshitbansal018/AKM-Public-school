'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { API_ENABLED } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/admin/Sidebar/Sidebar';
import LineIcon from '@/components/ui/LineIcon/LineIcon';
import { Loader } from '@/components/ui/Spinner/Spinner';
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
  // Sign-in and the forgot / reset password pages are reachable signed out.
  const isLoginPage = [loginPath, `/${portal}/forgot-password`, `/${portal}/reset-password`].includes(pathname);

  useEffect(() => {
    if (loading || isLoginPage) return;
    if (!isAuthenticated) router.replace(loginPath);
  }, [loading, isAuthenticated, isLoginPage, loginPath, router]);

  useEffect(() => setMenuOpen(false), [pathname]);

  // The login screen renders bare — no sidebar, no guard.
  if (isLoginPage) return children;

  if (loading) return <Loader label="Signing you in…" minHeight="100vh" />;

  if (!isAuthenticated) return <Loader label="Redirecting to sign in…" minHeight="100vh" />;

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
