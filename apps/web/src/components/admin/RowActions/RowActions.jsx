'use client';

import { cn } from '@/lib/cn';
import styles from './RowActions.module.css';

/** Small button used inside a table row. */
export function RowButton({ children, tone = 'default', onClick, disabled, title }) {
  return (
    <button
      type="button"
      className={cn(styles.button, styles[tone])}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  );
}

export function RowActions({ children }) {
  return <div className={styles.group}>{children}</div>;
}

export default RowActions;
