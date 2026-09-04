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

  // Editors never see the Users link. The API enforces it regardless.
  const visible = adminNav.filter((item) => !item.adminOnly || user?.role === 'ADMIN');

  return (
    <aside className={cn(styles.sidebar, open && styles.open)}>
      <div className={styles.brand}>
        <Image src="/icon.png" alt="" width={36} height={36} />
        <span>
          <b>AKM Admin</b>
          <small>Content Manager</small>
        </span>
      </div>

      <nav className={styles.nav} aria-label="Admin sections">
        <ul>
          {visible.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(styles.link, active && styles.active)}
                  onClick={onNavigate}
                  aria-current={active ? 'page' : undefined}
                >
                  <span aria-hidden="true">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={styles.footer}>
        {user ? (
          <div className={styles.user}>
            <b>{user.name}</b>
            <small>{user.email}</small>
          </div>
        ) : null}
        <button type="button" className={styles.logout} onClick={logout}>
          Sign out
        </button>
        <Link href="/" className={styles.viewSite} target="_blank">
          View site ↗
        </Link>
      </div>
    </aside>
  );
}
