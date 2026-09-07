import { getDownloads, getSettings } from '@/lib/serverApi';
import { text } from '@/lib/content';
import { API_URL } from '@/lib/api';
import { formatFileSize } from '@/lib/format';
import { buildMetadata } from '@/lib/seo';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
import Badge from '@/components/ui/Badge/Badge';
import Reveal from '@/components/ui/Reveal/Reveal';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import Button from '@/components/ui/Button/Button';
import styles from './downloads.module.css';

export const metadata = buildMetadata({
  title: 'Downloads',
  description:
    'Date sheets, admission forms, syllabus and prospectus downloads for AKM Public Sr. Sec. School.',
  path: '/downloads',
});

const CATEGORY_TONE = {
  datesheet: 'red',
  form: 'gold',
  result: 'green',
  syllabus: 'sky',
  general: 'muted',
};

export default async function DownloadsPage() {
  const [downloads, settings] = await Promise.all([getDownloads(), getSettings()]);

  return (
    <>
      <PageHeader
        title={text(settings, 'page_downloads_title', 'Downloads')}
        subtitle={text(settings, 'page_downloads_subtitle')}
        breadcrumbs={[{ label: 'Downloads' }]}
      />

      <section className="section">
        <div className="container">
          {downloads.length === 0 ? (
            <EmptyState
              icon="📄"
              title={text(settings, 'downloads_empty_title', 'No downloads available yet')}
              description={text(settings, 'downloads_empty_description')}
              action={<Button href="/contact">Contact the office</Button>}
            />
          ) : (
            <ul className={styles.list}>
              {downloads.map((item, index) => (
                <Reveal as="li" key={item.id} delay={Math.min(index, 4)} className={styles.item}>
                  <div className={styles.info}>
                    <span className={styles.icon} aria-hidden="true">
                      📄
                    </span>
                    <div>
                      <h3>{item.title}</h3>
                      <div className={styles.meta}>
                        <Badge tone={CATEGORY_TONE[item.category] || 'muted'}>
                          {item.category}
                        </Badge>
                        {item.fileSize ? <span>{formatFileSize(item.fileSize)}</span> : null}
                      </div>
                    </div>
                  </div>

                  {item.filePath && API_URL ? (
                    <a
                      className="btn btn-outline btn-sm"
                      href={`${API_URL}/downloads/${item.id}/file`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download
                    </a>
                  ) : (
                    <span className={styles.pending}>Available at the school office</span>
                  )}
                </Reveal>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
