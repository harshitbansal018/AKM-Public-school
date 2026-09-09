'use client';

import { useEffect, useRef, useState } from 'react';
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
  const [openDropdown, setOpenDropdown] = useState(null);
  const navRef = useRef(null);

  // Close everything whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  // A dropdown left open behind a click elsewhere, or on Escape, is a nuisance.
  useEffect(() => {
    if (!openDropdown) return undefined;

    const onClickAway = (event) => {
      if (!navRef.current?.contains(event.target)) setOpenDropdown(null);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpenDropdown(null);
    };

    document.addEventListener('mousedown', onClickAway);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onClickAway);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [openDropdown]);

  const isActive = (href) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  /** A parent is highlighted when it, or any of its children, is the current page. */
  const isGroupActive = (item) =>
    item.children ? item.children.some((child) => isActive(child.href)) : isActive(item.href);

  return (
    <header className={cn(styles.header, scrolled && styles.scrolled)}>
      <div className={`container ${styles.nav}`}>
        <Logo schoolName={settings.schoolName} tagline={settings.tagline} />

        <nav aria-label="Main" ref={navRef}>
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
            {navLinks.map((item) => {
              const active = isGroupActive(item);

              if (!item.children) {
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(styles.link, active && styles.active)}
                      aria-current={active ? 'page' : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              }

              const open = openDropdown === item.label;

              return (
                <li
                  key={item.label}
                  className={styles.hasDropdown}
                  // Hover opens it on desktop; the button below covers keyboard
                  // and touch, where hover does not exist.
                  onMouseEnter={() => setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button
                    type="button"
                    className={cn(styles.link, styles.dropdownToggle, active && styles.active)}
                    aria-expanded={open}
                    aria-haspopup="true"
                    onClick={() => setOpenDropdown(open ? null : item.label)}
                  >
                    {item.label}
                  </button>

                  <ul className={cn(styles.dropdown, open && styles.dropdownOpen)}>
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className={cn(
                            styles.dropdownLink,
                            isActive(child.href) && styles.dropdownActive
                          )}
                          onClick={() => setOpenDropdown(null)}
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
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
