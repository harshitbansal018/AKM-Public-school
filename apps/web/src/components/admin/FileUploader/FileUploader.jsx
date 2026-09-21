'use client';

import { useRef, useState } from 'react';
import { API_URL } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { cn } from '@/lib/cn';
import { DOCUMENT_ACCEPT, MAX_DOCUMENT_MB, DOCUMENT_RULE } from '@/constants/uploads';
import Spinner from '@/components/ui/Spinner/Spinner';
import LineIcon from '@/components/ui/LineIcon/LineIcon';
import styles from './FileUploader.module.css';

/**
 * Picks a document (PDF / Word), uploads it and reports back what was stored —
 * the ImageUploader's sibling for files that are downloaded rather than shown.
 *
 * @param {string}   props.endpoint  API path that accepts the multipart upload,
 *                                   e.g. '/teacher/homework/attachment'
 * @param {{path: string, name?: string, size?: number} | null} props.value
 * @param {Function} props.onChange  called with { path, name, size }, or null on remove
 */
export default function FileUploader({ label = 'File', endpoint, value, onChange, hint, className }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const upload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_DOCUMENT_MB * 1024 * 1024) {
      setError(`That file is ${(file.size / 1024 / 1024).toFixed(1)} MB — the limit is ${MAX_DOCUMENT_MB} MB`);
      return;
    }

    setError('');
    setBusy(true);
    const form = new FormData();
    form.append('file', file);

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getAccessToken()}` },
        body: form,
      });
      const payload = await res.json();
      if (!res.ok || payload.success === false) throw new Error(payload.message || 'Upload failed');
      onChange({ path: payload.data.path, name: payload.data.name, size: payload.data.size });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const inputId = `file-${label.replace(/\W+/g, '-').toLowerCase()}`;
  const sizeText = value?.size ? ` · ${(value.size / 1024 / 1024).toFixed(value.size > 1024 * 1024 ? 1 : 2)} MB` : '';

  return (
    <div className={cn(styles.wrap, className)}>
      <span className={styles.label}>{label}</span>

      {value?.path ? (
        <div className={styles.file}>
          <LineIcon name="documents" size={18} />
          <span className={styles.name}>
            {value.name ?? value.path.split('/').pop()}
            <small>{sizeText}</small>
          </span>
          <button type="button" className={styles.remove} onClick={() => onChange(null)} disabled={busy}>
            Remove
          </button>
        </div>
      ) : null}

      <div className={styles.controls}>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={DOCUMENT_ACCEPT}
          onChange={upload}
          disabled={busy}
          className={styles.input}
        />
        <label htmlFor={inputId} className={cn('btn btn-outline btn-sm', busy && styles.disabled)}>
          {busy ? (
            <>
              <Spinner size="xs" /> Uploading…
            </>
          ) : value?.path ? (
            'Replace file'
          ) : (
            'Choose file'
          )}
        </label>
        <small className={styles.hint}>{hint ?? DOCUMENT_RULE}</small>
        {error ? (
          <small className={styles.error} role="alert">
            {error}
          </small>
        ) : null}
      </div>
    </div>
  );
}
