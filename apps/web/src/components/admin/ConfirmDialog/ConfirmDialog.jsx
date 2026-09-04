'use client';

import Modal from '@/components/ui/Modal/Modal';
import styles from './ConfirmDialog.module.css';

/**
 * Deletions are irreversible and often remove uploaded files too, so every one
 * of them goes through this rather than a bare click.
 */
export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Delete',
  busy = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal open={open} onClose={busy ? () => {} : onCancel} title={title} className={styles.panel}>
      <p className={styles.message}>{message}</p>
      <div className={styles.actions}>
        <button type="button" className="btn btn-outline btn-sm" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
        <button
          type="button"
          className={`btn btn-sm ${styles.danger}`}
          onClick={onConfirm}
          disabled={busy}
        >
          {busy ? 'Working…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
