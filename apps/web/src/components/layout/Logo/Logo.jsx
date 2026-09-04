import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/cn';
import { LOGO_URL } from '@/data/fallback';
import styles from './Logo.module.css';

/**
 * School crest + wordmark.
 *
 * The crest is a local file run through next/image, so the 1254px source is
 * resized and served as WebP at the size actually needed. No remote host means
 * nothing to block, and no onError fallback to maintain — which is why this can
 * stay a server component.
 */
export default function Logo({ schoolName, tagline, variant = 'header', href = '/' }) {
  return (
    <Link href={href} className={cn(styles.logo, styles[variant])} aria-label={schoolName}>
      {/* fixed size, so no `sizes` — Next then emits a tight 1x/2x srcSet */}
      <Image className={styles.mark} src={LOGO_URL} alt="" width={56} height={56} priority />
      <span className={styles.text}>
        <b>{schoolName}</b>
        {tagline ? <small>{tagline}</small> : null}
      </span>
    </Link>
  );
}
