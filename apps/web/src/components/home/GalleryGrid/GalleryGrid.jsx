import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/cn';
import Reveal from '@/components/ui/Reveal/Reveal';
import Carousel from '@/components/ui/Carousel/Carousel';
import styles from './GalleryGrid.module.css';

/** Tiles in one desktop row. Past this, `slider` turns the section into one. */
const PER_VIEW = 4;

/**
 * Album tiles. An album with a cover photo shows it; one without falls back to
 * a striped theme block, matching the placeholder look of the old page.
 *
 * @param {object}  props
 * @param {boolean} [props.slider]  allow a slider once the tiles outgrow a row
 */
export default function GalleryGrid({ albums = [], slider = false }) {
  const asSlider = slider && albums.length > PER_VIEW;

  const tiles = albums.map((album, index) => (
    <Reveal key={album.id} delay={Math.min(index, 4)} disabled={asSlider}>
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
  ));

  if (asSlider) {
    return (
      <Carousel perView={PER_VIEW} label="albums">
        {tiles}
      </Carousel>
    );
  }

  return <div className={styles.grid}>{tiles}</div>;
}
