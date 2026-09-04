import { getSettings } from '@/lib/serverApi';
import { buildMetadata } from '@/lib/seo';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
import styles from '../legal.module.css';

export const metadata = buildMetadata({
  title: 'Terms & Conditions',
  description: 'Terms of use for the AKM Public Sr. Sec. School website.',
  path: '/terms',
});

export default async function TermsPage() {
  const settings = await getSettings();

  return (
    <>
      <PageHeader title="Terms & Conditions" breadcrumbs={[{ label: 'Terms & Conditions' }]} />

      <section className="section">
        <div className="container">
          <div className={styles.prose}>
            <p className={styles.updated}>Last updated: 1 April 2026</p>

            <h2>Use of this website</h2>
            <p>
              This website is operated by {settings.schoolName} to share information about the
              school with parents, students and the public. You may browse and print pages for
              personal, non-commercial use.
            </p>

            <h2>Accuracy of information</h2>
            <p>
              We work to keep dates, results and notices current, but details can change. For
              anything you plan to act on — an examination date, a fee amount, an admission
              deadline — please confirm with the school office.
            </p>

            <h2>Admission enquiries</h2>
            <p>
              Submitting an enquiry through this site is a request for information. It does not
              reserve a seat and does not constitute an offer of admission. Admission is confirmed
              only by the school office, in person, after documents are verified.
            </p>

            <h2>Intellectual property</h2>
            <p>
              The school name, crest, photographs and page content belong to {settings.schoolName}.
              Please do not reproduce them elsewhere without written permission.
            </p>

            <h2>External links</h2>
            <p>
              Where we link to HPBOSE or other external sites, we are not responsible for their
              content or availability.
            </p>

            <h2>Questions</h2>
            <p>
              Write to <a href={`mailto:${settings.email}`}>{settings.email}</a> or call{' '}
              {settings.phonePrimary}.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
