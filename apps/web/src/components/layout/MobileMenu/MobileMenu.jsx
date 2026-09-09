'use client';

import Link from 'next/link';
import { cn } from '@/lib/cn';
import { navLinks } from '@/constants/navLinks';
import styles from './MobileMenu.module.css';

/**
 * Slide-down navigation below 980px.
 *
 * Grouped items are shown expanded rather than as collapsible accordions —
 * there are only thirteen links in total, and every extra tap is a chance for
 * a parent on a phone to give up looking.
 */
export default function MobileMenu({ open, onNavigate, isActive }) {
  return (
    <div className={cn(styles.panel, open && styles.open)} hidden={!open}>
      <ul className={styles.list}>
        {navLinks.map((item) =>
          item.children ? (
            <li key={item.label} className={styles.group}>
              <span className={styles.groupLabel}>{item.label}</span>
              <ul className={styles.subList}>
                {item.children.map((child) => (
                  <li key={child.href}>
                    <Link
                      href={child.href}
                      className={cn(
                        styles.link,
                        styles.subLink,
                        isActive?.(child.href) && styles.active
                      )}
                      onClick={onNavigate}
                    >
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ) : (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(styles.link, isActive?.(item.href) && styles.active)}
                onClick={onNavigate}
              >
                {item.label}
              </Link>
            </li>
          )
        )}
      </ul>

      <Link href="/admissions" className="btn btn-primary btn-sm" onClick={onNavigate}>
        Admission Enquiry
      </Link>
    </div>
  );
}
