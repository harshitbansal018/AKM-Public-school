import { getSettings } from '@/lib/serverApi';
import { buildMetadata } from '@/lib/seo';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
import styles from '../legal.module.css';

export const metadata = buildMetadata({
  title: 'Disclaimer',
  description: 'Disclaimer for information published on the AKM Public Sr. Sec. School website.',
  path: '/disclaimer',
});

export default async function DisclaimerPage() {
  const settings = await getSettings();

  return (
    <>
      <PageHeader title="Disclaimer" breadcrumbs={[{ label: 'Disclaimer' }]} />

      <section className="section">
        <div className="container">
          <div className={styles.prose}>
            <p className={styles.updated}>Last updated: 1 April 2026</p>

            <h2>General information only</h2>
            <p>
              Everything published here is for general information about {settings.schoolName}. It
              is not legal, academic or financial advice.
            </p>

            <h2>Board matters</h2>
            <p>
              Curriculum, examination schedules and results are governed by the Himachal Pradesh
              Board of School Education. Where anything on this site differs from an official HPBOSE
              notification, the HPBOSE notification is correct.
            </p>

            <h2>Results and achievements</h2>
            <p>
              Marks and achievements are published with the consent of the students concerned and
              reflect the session stated. They are not a prediction of future results.
            </p>

            <h2>Photographs</h2>
            <p>
              Photographs of students are published with parental consent. If you would like a photo
              of your child removed, contact the school office and we will take it down.
            </p>

            <h2>Availability</h2>
            <p>
              We do not guarantee uninterrupted access to this site, and we are not liable for loss
              arising from its temporary unavailability.
            </p>

            <h2>Contact</h2>
            <p>
              For clarification on anything published here, write to{' '}
              <a href={`mailto:${settings.email}`}>{settings.email}</a>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
