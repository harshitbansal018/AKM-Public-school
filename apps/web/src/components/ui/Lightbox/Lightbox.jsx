'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './Lightbox.module.css';

/**
 * Full-screen image viewer for gallery albums.
 * Arrow keys move between images; Escape closes.
 *
 * @param {{ id: number, imagePath: string, caption?: string }[]} images
 * @param {number|null} startIndex  null = closed
 */
export default function Lightbox({ images = [], startIndex = null, onClose }) {
  const [index, setIndex] = useState(startIndex);

  useEffect(() => setIndex(startIndex), [startIndex]);

  const close = useCallback(() => {
    setIndex(null);
    onClose?.();
  }, [onClose]);

  const step = useCallback(
    (delta) => {
      setIndex((current) => {
        if (current === null) return current;
        return (current + delta + images.length) % images.length;
      });
    },
    [images.length]
  );

  useEffect(() => {
    if (index === null) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowRight') step(1);
      if (event.key === 'ArrowLeft') step(-1);
    };

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [index, close, step]);

  if (index === null || !images[index]) return null;

  const current = images[index];

  return (
    <div className={styles.backdrop} onClick={close} role="dialog" aria-modal="true">
      <button type="button" className={styles.close} onClick={close} aria-label="Close">
        ✕
      </button>

      {images.length > 1 ? (
        <button
          type="button"
          className={`${styles.nav} ${styles.prev}`}
          onClick={(event) => {
            event.stopPropagation();
            step(-1);
          }}
          aria-label="Previous image"
        >
          ‹
        </button>
      ) : null}

      <figure className={styles.figure} onClick={(event) => event.stopPropagation()}>
        <Image
          src={current.imagePath}
          alt={current.caption || ''}
          width={1400}
          height={950}
          className={styles.image}
          priority
        />
        <figcaption className={styles.caption}>
          {current.caption ? <span>{current.caption}</span> : null}
          <span className={styles.counter}>
            {index + 1} / {images.length}
          </span>
        </figcaption>
      </figure>

      {images.length > 1 ? (
        <button
          type="button"
          className={`${styles.nav} ${styles.next}`}
          onClick={(event) => {
            event.stopPropagation();
            step(1);
          }}
          aria-label="Next image"
        >
          ›
        </button>
      ) : null}
    </div>
  );
}
