import { cn } from '@/lib/cn';
import styles from './SchoolMap.module.css';

/**
 * The school's Google Map embed.
 *
 * One setting — `mapEmbedUrl` under Settings → Contact → Google Map — drives
 * every place the map appears, so the office pastes the link once and the
 * homepage, the Contact page and the Admissions page all follow.
 *
 * @param {object} props
 * @param {string} [props.src]     the embed URL; a placeholder shows without it
 * @param {number} [props.height]  in pixels, inline so a caller always wins
 */
export default function SchoolMap({
  src,
  height = 260,
  title = 'School location on Google Maps',
  className,
}) {
  if (!src) {
    return (
      <div className={cn(styles.placeholder, className)} style={{ height }}>
        🗺️ Google Map Embed Here
      </div>
    );
  }

  return (
    <iframe
      className={cn(styles.map, className)}
      style={{ height }}
      src={src}
      title={title}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}
