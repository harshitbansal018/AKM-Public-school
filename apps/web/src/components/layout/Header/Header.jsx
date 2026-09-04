'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { navLinks } from '@/constants/navLinks';
import { useScrolled } from '@/hooks/useScrolled';
import Logo from '@/components/layout/Logo/Logo';
import MobileMenu from '@/components/layout/MobileMenu/MobileMenu';
import styles from './Header.module.css';

/**
 * Sticky site header: crest, primary nav, and the admission CTA.
 * Gains a deeper shadow past 40px of scroll, matching the old page.
 */
export default function Header({ settings }) {
  const pathname = usePathname();
  const scrolled = useScrolled(40);
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu whenever the route changes.
  useEffect(() => setMenuOpen(false), [pathname]);

  const isActive = (href) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <header className={cn(styles.header, scrolled && styles.scrolled)}>
      <div className={`container ${styles.nav}`}>
        <Logo schoolName={settings.schoolName} tagline={settings.tagline} />

        <nav aria-label="Main">
          <button
            type="button"
            className={styles.toggle}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="main-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>

          <ul id="main-menu" className={styles.menu}>
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(styles.link, isActive(link.href) && styles.active)}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Link href="/admissions" className={`btn btn-primary btn-sm ${styles.cta}`}>
          Admission Enquiry
        </Link>
      </div>

      <MobileMenu open={menuOpen} onNavigate={() => setMenuOpen(false)} isActive={isActive} />
    </header>
  );
}
