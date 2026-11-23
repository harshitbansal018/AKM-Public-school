import { getSettings } from '@/lib/serverApi';
import { buildMetadata } from '@/lib/seo';
import { fillTemplate, text, toPairs } from '@/lib/content';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
import styles from '../legal.module.css';

const DEFAULT_SECTIONS = 'General information only::Everything published here is for general information about {schoolName}. It is not legal, academic or financial advice.|Board matters::Curriculum, examination schedules and results are governed by the Himachal Pradesh Board of School Education. An official HPBOSE notification takes priority over this website.|Results and achievements::Marks and achievements are published with consent and reflect the session stated. They are not a prediction of future results.|Photographs::Student photographs are published with parental consent. Contact the school office to request removal of a photograph.|Availability::We do not guarantee uninterrupted access and are not liable for loss arising from temporary unavailability.|Contact::For clarification, write to {email} or call {phonePrimary}.';

export async function generateMetadata() {
  const settings = await getSettings();
  return buildMetadata({
    title: text(settings, 'disclaimer_title', 'Disclaimer'),
    description: text(settings, 'disclaimer_meta_description', 'Disclaimer for information published on the school website.'),
    path: '/disclaimer',
  });
}

export default async function DisclaimerPage() {
  const settings = await getSettings();
  const title = text(settings, 'disclaimer_title', 'Disclaimer');
  const sections = toPairs(text(settings, 'disclaimer_sections', DEFAULT_SECTIONS));
  return (
    <>
      <PageHeader title={title} subtitle={text(settings, 'disclaimer_subtitle')} breadcrumbs={[{ label: title }]} />
      <section className="section">
        <div className="container">
          <div className={styles.prose}>
            <p className={styles.updated}>{text(settings, 'disclaimer_updated', 'Last updated: 1 April 2026')}</p>
            {sections.map((section) => (
              <section key={section.id}>
                <h2>{fillTemplate(section.title, settings)}</h2>
                <p>{fillTemplate(section.description, settings)}</p>
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
