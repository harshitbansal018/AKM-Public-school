'use client';

import { useRef, useState } from 'react';
import { API_URL } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { cn } from '@/lib/cn';
import styles from './ImageUploader.module.css';

/**
 * Picks an image, uploads it, and reports back the stored relative path.
 *
 * The value passed around is the path ("faculty/x.jpg"), not the URL — the API
 * turns it into a URL on the way out, so moving uploads to S3 later needs no
 * change here.
 *
 * Uses fetch rather than adminApi because multipart bodies need the browser to
 * set its own Content-Type boundary.
 *
 * @param {string}   props.folder    faculty | gallery | achievements | misc
 * @param {string}   props.value     current stored path (or a full URL)
 * @param {Function} props.onChange  called with the new path, or null on remove
 */
export default function ImageUploader({
  label = 'Image',
  folder = 'misc',
  value,
  onChange,
  hint,
  className,
}) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);

  // A freshly uploaded file gives us an absolute URL; an existing record gives
  // a stored path that still needs the API origin in front of it.
  const previewSrc =
    preview ??
    (!value ? null : /^https?:\/\//i.test(value) ? value : `${API_URL.replace('/api/v1', '')}/uploads/${value}`);

  const upload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Choose an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('That image is larger than 5 MB');
      return;
    }

    setError('');
    setBusy(true);

    const form = new FormData();
    form.append('file', file);

    try {
      const res = await fetch(`${API_URL}/admin/uploads/${folder}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getAccessToken()}` },
        body: form,
      });
      const payload = await res.json();
      if (!res.ok || payload.success === false) {
        throw new Error(payload.message || 'Upload failed');
      }

      setPreview(payload.data.url);
      onChange(payload.data.path);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const clear = () => {
    setPreview(null);
    setError('');
    onChange(null);
  };

  const inputId = `upload-${folder}-${label.replace(/\W+/g, '-').toLowerCase()}`;

  return (
    <div className={cn(styles.wrap, className)}>
      <span className={styles.label}>{label}</span>

      <div className={styles.row}>
        <div className={styles.previewBox}>
          {previewSrc ? (
            // eslint-disable-next-line @next/next/no-img-element -- blob/preview URLs change per upload
            <img src={previewSrc} alt="" className={styles.preview} />
          ) : (
            <span className={styles.placeholder}>No image</span>
          )}
        </div>

        <div className={styles.controls}>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept="image/*"
            onChange={upload}
            disabled={busy}
            className={styles.input}
          />
          <label htmlFor={inputId} className={cn('btn btn-outline btn-sm', busy && styles.disabled)}>
            {busy ? 'Uploading…' : previewSrc ? 'Replace' : 'Choose image'}
          </label>

          {previewSrc ? (
            <button type="button" className={styles.remove} onClick={clear} disabled={busy}>
              Remove
            </button>
          ) : null}

          {hint ? <small className={styles.hint}>{hint}</small> : null}
          {error ? (
            <small className={styles.error} role="alert">
              {error}
            </small>
          ) : null}
        </div>
      </div>
    </div>
  );
}
