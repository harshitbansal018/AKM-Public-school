import { cn } from '@/lib/cn';
import styles from './Spinner.module.css';

/**
 * The one loading indicator used across the website and the three portals.
 *
 * @param {'xs'|'sm'|'md'|'lg'} [size]  xs sits inside a button, lg fills a page
 * @param {string} [label]              visible text beside the ring
 */
export default function Spinner({ size = 'md', label, className }) {
  return (
    <span className={cn(styles.wrap, className)} role="status" aria-live="polite">
      <span className={cn(styles.ring, styles[size])} aria-hidden="true" />
      {label ? <span className={styles.label}>{label}</span> : <span className="sr-only">Loading</span>}
    </span>
  );
}

/** A spinner centred in the space it is given — the "page is loading" state. */
export function Loader({ label = 'Loading…', size = 'lg', className, minHeight }) {
  return (
    <div className={cn(styles.block, className)} style={minHeight ? { minHeight } : undefined}>
      <Spinner size={size} label={label} />
    </div>
  );
}
