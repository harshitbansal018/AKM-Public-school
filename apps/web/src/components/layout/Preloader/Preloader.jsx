'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/cn';
import { LOGO_URL } from '@/data/fallback';
import styles from './Preloader.module.css';

/**
 * Bouncing-crest splash shown while the page paints.
 *
 * Hides on window load, with a 2.5s hard fallback so a slow third-party asset
 * can never leave a visitor staring at the splash — same guard as the old page.
 * Skipped entirely for users who prefer reduced motion.
 */
export default function Preloader({ schoolName }) {
  const [done, setDone] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRemoved(true);
      return undefined;
    }

    const finish = () => setDone(true);

    if (document.readyState === 'complete') {
      const quick = setTimeout(finish, 400);
      return () => clearTimeout(quick);
    }

    window.addEventListener('load', finish);
    const fallback = setTimeout(finish, 2500);

    return () => {
      window.removeEventListener('load', finish);
      clearTimeout(fallback);
    };
  }, []);

  // Drop from the DOM after the fade-out so it can never trap focus.
  useEffect(() => {
    if (!done) return undefined;
    const timer = setTimeout(() => setRemoved(true), 600);
    return () => clearTimeout(timer);
  }, [done]);

  if (removed) return null;

  return (
    <div className={cn(styles.preloader, done && styles.done)} aria-hidden="true">
      <Image className={styles.mark} src={LOGO_URL} alt="" width={94} height={94} priority />
      <div className={styles.text}>{schoolName}</div>
    </div>
  );
}
