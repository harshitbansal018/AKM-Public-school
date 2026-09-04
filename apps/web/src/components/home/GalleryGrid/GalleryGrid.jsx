import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/cn';
import Reveal from '@/components/ui/Reveal/Reveal';
import styles from './GalleryGrid.module.css';

/**
 * Album tiles. An album with a cover photo shows it; one without falls back to
 * a striped theme block, matching the placeholder look of the old page.
 */
export default function GalleryGrid({ albums = [] }) {
  return (
    <div className={styles.grid}>
      {albums.map((album, index) => (
        <Reveal key={album.id} delay={Math.min(index, 4)}>
          <Link
            href={`/gallery/${album.slug}`}
            className={cn(styles.tile, !album.coverImage && styles[album.theme || 'g1'])}
          >
            {album.coverImage ? (
              <Image
                src={album.coverImage}
                alt={album.title}
                fill
                sizes="(max-width: 600px) 50vw, (max-width: 980px) 33vw, 25vw"
                className={styles.image}
              />
            ) : null}
            <span className={styles.label}>{album.title}</span>
            <span className={styles.overlay} aria-hidden="true">
              📷 View Album
            </span>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
