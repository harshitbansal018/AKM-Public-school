import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getNoticeBySlug, getNotices } from '@/lib/serverApi';
import { formatLongDate, toISODate } from '@/lib/format';
import { buildMetadata } from '@/lib/seo';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
import Badge from '@/components/ui/Badge/Badge';
import Button from '@/components/ui/Button/Button';
import styles from './notice.module.css';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const notice = await getNoticeBySlug(slug);

  if (!notice) return buildMetadata({ title: 'Notice not found', path: `/notices/${slug}` });

  return buildMetadata({
    title: notice.title,
    description: notice.excerpt,
    path: `/notices/${slug}`,
  });
}

export default async function NoticeDetailPage({ params }) {
  const { slug } = await params;
  const notice = await getNoticeBySlug(slug);

  if (!notice) notFound();

  // A few other notices to keep visitors moving through the site.
  const { items } = await getNotices({ page: 1, limit: 4 });
  const related = items.filter((item) => item.slug !== slug).slice(0, 3);

  return (
    <>
      <PageHeader
        title={notice.title}
        breadcrumbs={[{ label: 'News & Events', href: '/notices' }, { label: notice.title }]}
      />

      <article className="section">
        <div className={`container ${styles.article}`}>
          <div className={styles.meta}>
            <Badge tone="sky">{notice.category}</Badge>
            <time dateTime={toISODate(notice.noticeDate)}>{formatLongDate(notice.noticeDate)}</time>
          </div>

          <div className={styles.body}>
            {(notice.body || notice.excerpt || '')
              .split('\n')
              .filter(Boolean)
              .map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
          </div>

          {notice.download ? (
            <a
              className={`btn btn-outline ${styles.attachment}`}
              href={notice.download.filePath}
              target="_blank"
              rel="noopener noreferrer"
            >
              📄 {notice.download.title}
            </a>
          ) : null}

          <div className={styles.actions}>
            <Button href="/notices" variant="outline" small>
              ← All notices
            </Button>
            <Button href="/contact" small>
              Contact the school
            </Button>
          </div>
        </div>
      </article>

      {related.length > 0 ? (
        <section className="section bg-white">
          <div className="container">
            <h2 className={styles.relatedHeading}>More Notices</h2>
            <ul className={styles.related}>
              {related.map((item) => (
                <li key={item.id}>
                  <Link href={`/notices/${item.slug}`}>
                    <time dateTime={toISODate(item.noticeDate)}>
                      {formatLongDate(item.noticeDate)}
                    </time>
                    <h3>{item.title}</h3>
                    <p>{item.excerpt}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </>
  );
}
