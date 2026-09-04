import Link from 'next/link';
import { cn } from '@/lib/cn';
import styles from './Pagination.module.css';

/**
 * Server-rendered pagination — pages are plain links so the list stays
 * crawlable and works without JavaScript.
 *
 * @param {object} props
 * @param {number} props.page        current page (1-based)
 * @param {number} props.totalPages
 * @param {string} props.basePath    e.g. '/notices'
 * @param {object} [props.query]     extra query params to preserve
 */
export default function Pagination({ page, totalPages, basePath, query = {} }) {
  if (totalPages <= 1) return null;

  const hrefFor = (target) => {
    const params = new URLSearchParams(query);
    if (target > 1) params.set('page', String(target));
    else params.delete('page');
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  // Show at most 5 numbered pages, centred on the current one.
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  const pages = [];
  for (let i = start; i <= end; i += 1) pages.push(i);

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={styles.arrow} rel="prev">
          ← Prev
        </Link>
      ) : (
        <span className={cn(styles.arrow, styles.disabled)}>← Prev</span>
      )}

      <ul className={styles.pages}>
        {pages.map((item) => (
          <li key={item}>
            {item === page ? (
              <span className={cn(styles.page, styles.current)} aria-current="page">
                {item}
              </span>
            ) : (
              <Link href={hrefFor(item)} className={styles.page}>
                {item}
              </Link>
            )}
          </li>
        ))}
      </ul>

      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className={styles.arrow} rel="next">
          Next →
        </Link>
      ) : (
        <span className={cn(styles.arrow, styles.disabled)}>Next →</span>
      )}
    </nav>
  );
}
