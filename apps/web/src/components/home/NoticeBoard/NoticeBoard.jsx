import Link from 'next/link';
import { toDateBadge, toISODate } from '@/lib/format';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import styles from './NoticeBoard.module.css';

/**
 * Latest notices panel. Each row links to the full notice page, so the
 * headlines are indexable rather than trapped in a homepage widget.
 */
export default function NoticeBoard({ notices = [], title = '📌 Latest News & Notices' }) {
  return (
    <div className={styles.box}>
      <div className={styles.head}>
        <span>{title}</span>
        <Link href="/notices">View All</Link>
      </div>

      {notices.length === 0 ? (
        <div className={styles.empty}>
          <EmptyState icon="📭" title="No notices yet" description="Check back soon." />
        </div>
      ) : (
        notices.map((notice) => {
          const badge = toDateBadge(notice.noticeDate);
          return (
            <Link key={notice.id} href={`/notices/${notice.slug}`} className={styles.notice}>
              <time className={styles.date} dateTime={toISODate(notice.noticeDate)}>
                <b>{badge.day}</b>
                <span>{badge.month}</span>
              </time>
              <div>
                <h4>{notice.title}</h4>
                <p>{notice.excerpt}</p>
              </div>
            </Link>
          );
        })
      )}
    </div>
  );
}
