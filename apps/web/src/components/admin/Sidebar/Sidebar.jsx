'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { useAuth } from '@/context/AuthContext';
import LineIcon from '@/components/ui/LineIcon/LineIcon';
import styles from './Sidebar.module.css';

/**
 * Portal sidebar: brand, grouped navigation, signed-in user and sign out.
 *
 * @param {object} props
 * @param {object[]} props.nav   sections of { label, items: [{ href, label, icon, adminOnly? }] }
 * @param {{name: string, tagline: string}} props.brand
 */
export default function Sidebar({ nav, brand, open, onNavigate }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isAdmin = user?.role === 'ADMIN';

  return (
    <aside className={cn(styles.sidebar, open && styles.open)}>
      {/* Brand */}
      <div className={styles.brand}>
        <Image src="/icon.png" alt="" width={36} height={36} />
        <span>
          <b>{brand.name}</b>
          <small>{brand.tagline}</small>
        </span>
      </div>

      {/* Navigation */}
      <nav className={styles.nav} aria-label={`${brand.name} sections`}>
        {nav.map((section) => {
          // adminOnly is UI-level only; the API enforces the role independently.
          const visibleItems = section.items.filter((item) => !item.adminOnly || isAdmin);

          // Don't render an empty section
          if (visibleItems.length === 0) {
            return null;
          }

          return (
            <div className={styles.section} key={section.label}>
              <div className={styles.sectionTitle}>{section.label}</div>

              <ul className={styles.sectionList}>
                {visibleItems.map((item) => {
                  const active =
                    pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(styles.link, active && styles.active)}
                        onClick={onNavigate}
                        aria-current={active ? 'page' : undefined}
                      >
                        <span className={styles.icon} aria-hidden="true">
                          <LineIcon name={item.icon} size={18} />
                        </span>
                        <span className={styles.label}>{item.label}</span>
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

        <button type="button" className={styles.logout} onClick={() => logout()}>
          Sign out
        </button>

        <Link href="/" className={styles.viewSite} target="_blank" rel="noopener noreferrer">
          View site ↗
        </Link>
      </div>
    </aside>
  );
}
