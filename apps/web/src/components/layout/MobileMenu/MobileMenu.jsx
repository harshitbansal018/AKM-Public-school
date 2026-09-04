'use client';

import Link from 'next/link';
import { cn } from '@/lib/cn';
import { navLinks } from '@/constants/navLinks';
import styles from './MobileMenu.module.css';

/**
 * Slide-down navigation panel below 980px.
 * Rendered as a sibling of the header row so it spans the full width.
 */
export default function MobileMenu({ open, onNavigate, isActive }) {
  return (
    <div className={cn(styles.panel, open && styles.open)} hidden={!open}>
      <ul className={styles.list}>
        {navLinks.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={cn(styles.link, isActive?.(link.href) && styles.active)}
              onClick={onNavigate}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/admissions" className="btn btn-primary btn-sm" onClick={onNavigate}>
        Admission Enquiry
      </Link>
    </div>
  );
}
