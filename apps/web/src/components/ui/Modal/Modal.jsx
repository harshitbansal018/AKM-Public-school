'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';
import styles from './Modal.module.css';

/**
 * Accessible dialog: closes on Escape and backdrop click, locks body scroll,
 * and returns focus to whatever was focused before it opened.
 */
export default function Modal({ open, onClose, title, children, className }) {
  const panelRef = useRef(null);
  const lastFocused = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    lastFocused.current = document.activeElement;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
      lastFocused.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={styles.backdrop}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        ref={panelRef}
        className={cn(styles.panel, className)}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
          ✕
        </button>
        {title ? <h3 className={styles.title}>{title}</h3> : null}
        {children}
      </div>
    </div>
  );
}
