import Link from 'next/link';
import { cn } from '@/lib/cn';
import styles from './Pagination.module.css';

/**
 * Page controls, in one of two modes:
 *
 *  - Links (`basePath` + `query`): server-rendered pages such as Notices.
 *    Pages are plain URLs, so the list stays crawlable and works without JS.
 *  - Buttons (`onChange`): client-side paging of an already-loaded list, as in
 *    the admin tables.
 *
 * @param {object} props
 * @param {number} props.page        current page (1-based)
 * @param {number} props.totalPages
 * @param {string} [props.basePath]  e.g. '/notices'
 * @param {object} [props.query]     extra query params to preserve in links
 * @param {(page: number) => void} [props.onChange]  button mode
 * @param {string} [props.summary]   e.g. "Showing 26–50 of 120"
 * @param {boolean} [props.compact]  tighter spacing, for inside panels
 */
export default function Pagination({ page, totalPages, basePath, query = {}, onChange, summary, compact }) {
  if (totalPages <= 1 && !summary) return null;

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

  /** A page control as a link or a button, depending on the mode. */
  const control = (target, label, className, extra = {}) =>
    onChange ? (
      <button type="button" className={className} onClick={() => onChange(target)} {...extra}>
        {label}
      </button>
    ) : (
      <Link href={hrefFor(target)} className={className} {...extra}>
        {label}
      </Link>
    );

  return (
    <nav className={cn(styles.pagination, compact && styles.compact)} aria-label="Pagination">
      {summary ? <span className={styles.summary}>{summary}</span> : null}

      {totalPages > 1 ? (
        <>
          {page > 1 ? (
            control(page - 1, '← Prev', styles.arrow, { rel: 'prev' })
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
                  control(item, item, styles.page)
                )}
              </li>
            ))}
          </ul>

          {page < totalPages ? (
            control(page + 1, 'Next →', styles.arrow, { rel: 'next' })
          ) : (
            <span className={cn(styles.arrow, styles.disabled)}>Next →</span>
          )}
        </>
      ) : null}
    </nav>
  );
}
