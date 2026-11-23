import { getSettings } from '@/lib/serverApi';
import { buildMetadata } from '@/lib/seo';
import { fillTemplate, text, toPairs } from '@/lib/content';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
import styles from '../legal.module.css';

const DEFAULT_SECTIONS = 'Use of this website::This website is operated by {schoolName} to share information about the school with parents, students and the public. You may browse and print pages for personal, non-commercial use.|Accuracy of information::We work to keep dates, results and notices current, but details can change. Please confirm examination dates, fees and admission deadlines with the school office.|Admission enquiries::Submitting an enquiry does not reserve a seat or constitute an offer of admission. Admission is confirmed by the school office after documents are verified.|Intellectual property::The school name, crest, photographs and page content belong to {schoolName}. Please do not reproduce them without written permission.|External links::Where we link to HPBOSE or other external sites, we are not responsible for their content or availability.|Questions::Write to {email} or call {phonePrimary}.';

export async function generateMetadata() {
  const settings = await getSettings();
  return buildMetadata({
    title: text(settings, 'terms_title', 'Terms & Conditions'),
    description: text(settings, 'terms_meta_description', 'Terms of use for the school website.'),
    path: '/terms',
  });
}

export default async function TermsPage() {
  const settings = await getSettings();
  const title = text(settings, 'terms_title', 'Terms & Conditions');
  const sections = toPairs(text(settings, 'terms_sections', DEFAULT_SECTIONS));
  return (
    <>
      <PageHeader title={title} subtitle={text(settings, 'terms_subtitle')} breadcrumbs={[{ label: title }]} />
      <section className="section">
        <div className="container">
          <div className={styles.prose}>
            <p className={styles.updated}>{text(settings, 'terms_updated', 'Last updated: 1 April 2026')}</p>
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
