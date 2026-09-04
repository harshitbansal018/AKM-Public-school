import { getSettings } from '@/lib/serverApi';
import { buildMetadata } from '@/lib/seo';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
import styles from '../legal.module.css';

export const metadata = buildMetadata({
  title: 'Privacy Policy',
  description: 'How AKM Public Sr. Sec. School handles information submitted through this website.',
  path: '/privacy-policy',
});

export default async function PrivacyPolicyPage() {
  const settings = await getSettings();

  return (
    <>
      <PageHeader title="Privacy Policy" breadcrumbs={[{ label: 'Privacy Policy' }]} />

      <section className="section">
        <div className="container">
          <div className={styles.prose}>
            <p className={styles.updated}>Last updated: 1 April 2026</p>

            <h2>What we collect</h2>
            <p>
              When you submit an admission enquiry through this website, we collect the name and
              phone number you provide, and optionally the student name, class and message. We do
              not ask for payment details anywhere on this site.
            </p>

            <h2>Why we collect it</h2>
            <p>
              The only purpose is to respond to your enquiry. A member of the school office uses
              your phone number to call you back about admission.
            </p>

            <h2>Who can see it</h2>
            <p>
              Enquiries are visible only to authorised school staff through a password-protected
              admin panel. We do not sell, rent or share this information with third parties.
            </p>

            <h2>How long we keep it</h2>
            <p>
              Enquiries are retained for the duration of the admission session and archived
              afterwards for our records.
            </p>

            <h2>Cookies</h2>
            <p>
              This website does not use advertising or tracking cookies. Fonts are loaded from
              Google Fonts, which may log the request as part of serving those files.
            </p>

            <h2>Contact us</h2>
            <p>
              To ask about or request deletion of information you have submitted, write to{' '}
              <a href={`mailto:${settings.email}`}>{settings.email}</a> or call{' '}
              {settings.phonePrimary}.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
