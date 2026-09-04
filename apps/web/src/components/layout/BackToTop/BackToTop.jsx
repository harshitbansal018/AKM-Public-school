'use client';

import { cn } from '@/lib/cn';
import { useScrolled } from '@/hooks/useScrolled';
import styles from './BackToTop.module.css';

/** Floating scroll-to-top button, appearing past 500px. */
export default function BackToTop() {
  const show = useScrolled(500);

  return (
    <button
      type="button"
      className={cn(styles.button, show && styles.show)}
      aria-label="Back to top"
      tabIndex={show ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      ↑
    </button>
  );
}
