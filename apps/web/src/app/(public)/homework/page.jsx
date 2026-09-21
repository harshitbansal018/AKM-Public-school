import Link from 'next/link';
import { getPublicHomework, getSettings } from '@/lib/serverApi';
import { buildMetadata } from '@/lib/seo';
import { cn } from '@/lib/cn';
import { text } from '@/lib/content';
import { formatLongDate } from '@/lib/format';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import Reveal from '@/components/ui/Reveal/Reveal';
import Pagination from '@/components/ui/Pagination/Pagination';
import styles from './homework.module.css';

export async function generateMetadata() {
  const settings = await getSettings();
  return buildMetadata({
    title: text(settings, 'page_homework_title', 'Homework'),
    description: text(settings, 'page_homework_subtitle', 'Published assignments and due dates.'),
    path: '/homework',
  });
}

const PER_PAGE = 20;

/**
 * Published homework, newest first, filterable by class and paged. Filters and
 * pages are plain links so each view is its own URL a parent can bookmark.
 */
export default async function HomeworkPage({ searchParams }) {
  const params = await searchParams;
  const [items, settings] = await Promise.all([getPublicHomework(), getSettings()]);

  const classes = [...new Set(items.map((item) => item.classGroup))];
  const selected = classes.includes(params?.class) ? params.class : '';
  const matching = selected ? items.filter((item) => item.classGroup === selected) : items;

  const totalPages = Math.max(1, Math.ceil(matching.length / PER_PAGE));
  const page = Math.min(Math.max(1, Number(params?.page) || 1), totalPages);
  const visible = matching.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <>
      <PageHeader
        title={text(settings, 'page_homework_title', 'Homework')}
        subtitle={text(settings, 'page_homework_subtitle', 'Published assignments and due dates.')}
        breadcrumbs={[{ label: 'Homework' }]}
      />

      <section className="section">
        <div className="container">
          {classes.length > 1 ? (
            <nav className={styles.filters} aria-label="Filter homework by class">
              <Link href="/homework" className={cn(styles.filter, !selected && styles.active)}>
                All classes
              </Link>
              {classes.map((name) => (
                <Link
                  key={name}
                  href={`/homework?class=${encodeURIComponent(name)}`}
                  className={cn(styles.filter, selected === name && styles.active)}
                  aria-current={selected === name ? 'true' : undefined}
                >
                  {name}
                </Link>
              ))}
            </nav>
          ) : null}

          {visible.length === 0 ? (
            <EmptyState title="No homework published" description="Please check again later." />
          ) : (
            <ul className={styles.list}>
              {visible.map((item, index) => (
                <Reveal as="li" key={item.id} delay={Math.min(index, 4)} className={styles.item}>
                  <div className={styles.meta}>
                    <span className={styles.class}>{item.classGroup}</span>
                    <span className={styles.subject}>{item.subject}</span>
                    {item.dueDate ? <span className={styles.due}>Due {formatLongDate(item.dueDate)}</span> : null}
                  </div>
                  <h2>{item.title}</h2>
                  {item.description ? <p>{item.description}</p> : null}
                  {item.attachmentUrl ? (
                    <a
                      href={item.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.attachment}
                    >
                      Download {item.attachmentName ?? 'worksheet'}
                    </a>
                  ) : null}
                </Reveal>
              ))}
            </ul>
          )}

          <Pagination
            page={page}
            totalPages={totalPages}
            basePath="/homework"
            query={selected ? { class: selected } : {}}
          />
        </div>
      </section>
    </>
  );
}
