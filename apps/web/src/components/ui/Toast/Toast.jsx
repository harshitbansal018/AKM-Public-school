'use client';

import { cn } from '@/lib/cn';
import styles from './Toast.module.css';

const ICONS = {
  success: '✅',
  error: '⚠️',
  info: 'ℹ️',
};

/**
 * Renders the toast stack. Mounted once by ToastProvider — you normally
 * trigger toasts through the useToast() hook rather than using this directly.
 */
export default function ToastStack({ toasts = [], onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div className={styles.stack} role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={cn(styles.toast, styles[toast.tone])}>
          <span className={styles.icon} aria-hidden="true">
            {ICONS[toast.tone] ?? ICONS.info}
          </span>
          <span className={styles.message}>{toast.message}</span>
          <button
            type="button"
            className={styles.dismiss}
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
