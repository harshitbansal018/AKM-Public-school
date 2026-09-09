'use client';

import { useState } from 'react';
import Image from 'next/image';
import Lightbox from '@/components/ui/Lightbox/Lightbox';
import styles from './album.module.css';

/**
 * Photo grid for one album. Clicking a thumbnail opens the lightbox, which
 * handles keyboard navigation and closing.
 */
export default function AlbumViewer({ images = [], albumTitle }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <>
      <ul className={styles.grid}>
        {images.map((image, index) => (
          <li key={image.id}>
            <button
              type="button"
              className={styles.thumb}
              onClick={() => setOpenIndex(index)}
              aria-label={image.caption || `${albumTitle} photo ${index + 1}`}
            >
              <Image
                src={image.imagePath}
                alt={image.caption || ''}
                fill
                sizes="(max-width: 600px) 100vw, (max-width: 980px) 50vw, 33vw"
                className={styles.image}
              />
              {image.caption ? <span className={styles.caption}>{image.caption}</span> : null}
            </button>
          </li>
        ))}
      </ul>

      <Lightbox images={images} startIndex={openIndex} onClose={() => setOpenIndex(null)} />
    </>
  );
}
