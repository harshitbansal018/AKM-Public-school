'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { adminNav } from '@/constants/adminNav';
import { useAuth } from '@/context/AuthContext';
import styles from './Sidebar.module.css';

export default function Sidebar({ open, onNavigate }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isAdmin = user?.role === 'ADMIN';

  return (
    <aside className={cn(styles.sidebar, open && styles.open)}>
      {/* Brand */}
      <div className={styles.brand}>
        <Image
          src="/icon.png"
          alt=""
          width={36}
          height={36}
        />

        <span>
          <b>AKM Admin</b>
          <small>Content Manager</small>
        </span>
      </div>

      {/* Navigation */}
      <nav
        className={styles.nav}
        aria-label="Admin sections"
      >
        {adminNav.map((section) => {
          // Remove admin-only items for non-admin users
          const visibleItems = section.items.filter(
            (item) => !item.adminOnly || isAdmin
          );

          // Don't render an empty section
          if (visibleItems.length === 0) {
            return null;
          }

          return (
            <div
              className={styles.section}
              key={section.label}
            >
              {/* Section heading */}
              <div className={styles.sectionTitle}>
                {section.label}
              </div>

              <ul className={styles.sectionList}>
                {visibleItems.map((item) => {
                  const active =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          styles.link,
                          active && styles.active
                        )}
                        onClick={onNavigate}
                        aria-current={
                          active ? 'page' : undefined
                        }
                      >
                        <span
                          className={styles.icon}
                          aria-hidden="true"
                        >
                          {item.icon}
                        </span>

                        <span className={styles.label}>
                          {item.label}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={styles.footer}>
        {user ? (
          <div className={styles.user}>
            <b>{user.name}</b>
            <small>{user.email}</small>
          </div>
        ) : null}

        <button
          type="button"
          className={styles.logout}
          onClick={logout}
        >
          Sign out
        </button>

        <Link
          href="/"
          className={styles.viewSite}
          target="_blank"
          rel="noopener noreferrer"
        >
          View site ↗
        </Link>
      </div>
    </aside>
  );
}