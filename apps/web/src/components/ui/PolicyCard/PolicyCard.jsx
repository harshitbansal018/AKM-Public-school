'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { htmlPreview } from '@/lib/content';
import { formatLongDate } from '@/lib/format';
import styles from './PolicyCard.module.css';

/** Longer than this (characters of text) and the card opens collapsed with a "Read full policy" toggle. */
const PREVIEW_CHARS = 600;

/**
 * One policy: title, dates, and its content — HTML written in the admin
 * panel's editor and sanitised by the API before it was stored.
 */
export default function PolicyCard({ policy }) {
  const collapsible = htmlPreview(policy.content).length > PREVIEW_CHARS;
  const [open, setOpen] = useState(!collapsible);

  return (
    <article className={styles.card} id={`policy-${policy.id}`}>
      <header className={styles.head}>
        <h3>{policy.title}</h3>
        <p className={styles.dates}>
          {policy.effectiveDate ? <span>Effective from {formatLongDate(policy.effectiveDate)}</span> : null}
          {policy.updatedAt ? <span>Updated {formatLongDate(policy.updatedAt)}</span> : null}
        </p>
      </header>

      <div
        className={cn('rich-text', styles.body, collapsible && !open && styles.faded)}
        // Sanitised server-side (api/src/utils/html.js) before it was stored.
        dangerouslySetInnerHTML={{ __html: policy.content }}
      />

      {collapsible ? (
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={`policy-${policy.id}`}
        >
          {open ? 'Show less' : 'Read full policy'}
        </button>
      ) : null}
    </article>
  );
}
