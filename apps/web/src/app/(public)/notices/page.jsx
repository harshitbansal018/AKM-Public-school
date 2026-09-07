import Link from 'next/link';
import { getNotices, getSettings } from '@/lib/serverApi';
import { text } from '@/lib/content';
import { toDateBadge, toISODate } from '@/lib/format';
import { noticeCategories } from '@/constants/classGroups';
import { buildMetadata } from '@/lib/seo';
import { cn } from '@/lib/cn';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
import Badge from '@/components/ui/Badge/Badge';
import Reveal from '@/components/ui/Reveal/Reveal';
import Pagination from '@/components/ui/Pagination/Pagination';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import styles from './notices.module.css';

export const metadata = buildMetadata({
  title: 'News & Notices',
  description:
    'Latest announcements, examination date sheets, results and event news from AKM Public Sr. Sec. School.',
  path: '/notices',
});

const PER_PAGE = 10;

/**
 * Notice list. Filters and pagination are plain links rather than client state,
 * so every filtered view is its own crawlable URL.
 */
export default async function NoticesPage({ searchParams }) {
  const params = await searchParams;
  const page = Math.max(1, Number(params?.page) || 1);
  const category = params?.category || '';

  const [{ items, meta }, settings] = await Promise.all([
    getNotices({ page, limit: PER_PAGE, category }),
    getSettings(),
  ]);

  return (
    <>
      <PageHeader
        title={text(settings, 'page_notices_title', 'News & Notices')}
        subtitle={text(settings, 'page_notices_subtitle')}
        breadcrumbs={[{ label: 'News & Events' }]}
      />

      <section className="section">
        <div className="container">
          <nav className={styles.filters} aria-label="Filter notices by category">
            {noticeCategories.map((option) => {
              const href = option.value ? `/notices?category=${option.value}` : '/notices';
              const active = category === option.value;
              return (
                <Link
                  key={option.label}
                  href={href}
                  className={cn(styles.filter, active && styles.active)}
                  aria-current={active ? 'true' : undefined}
                >
                  {option.label}
                </Link>
              );
            })}
          </nav>

          {items.length === 0 ? (
            <EmptyState
              icon="📭"
              title={text(settings, 'notices_empty_title', 'No notices in this category')}
              description={text(settings, 'notices_empty_description')}
            />
          ) : (
            <ul className={styles.list}>
              {items.map((notice, index) => {
                const badge = toDateBadge(notice.noticeDate);
                return (
                  <Reveal
                    as="li"
                    key={notice.id}
                    delay={Math.min(index, 4)}
                    className={styles.item}
                  >
                    <Link href={`/notices/${notice.slug}`} className={styles.link}>
                      <time className={styles.date} dateTime={toISODate(notice.noticeDate)}>
                        <b>{badge.day}</b>
                        <span>{badge.month}</span>
                        <small>{badge.year}</small>
                      </time>

                      <div className={styles.body}>
                        <div className={styles.badges}>
                          <Badge tone="sky">{notice.category}</Badge>
                          {notice.isPinned ? <Badge tone="gold">Pinned</Badge> : null}
                        </div>
                        <h2>{notice.title}</h2>
                        <p>{notice.excerpt}</p>
                        <span className={styles.more}>Read notice →</span>
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
            </ul>
          )}

          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            basePath="/notices"
            query={category ? { category } : {}}
          />
        </div>
      </section>
    </>
  );
}
