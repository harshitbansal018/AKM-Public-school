import { getSettings } from '@/lib/serverApi';
import { admission } from '@/data/fallback';
import { buildMetadata } from '@/lib/seo';
import { text, toList, toPairs } from '@/lib/content';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
import SectionIntro from '@/components/ui/SectionIntro/SectionIntro';
import Reveal from '@/components/ui/Reveal/Reveal';
import AdmissionCard from '@/components/home/AdmissionCard/AdmissionCard';
import EnquiryForm from '@/components/forms/EnquiryForm/EnquiryForm';
import styles from './admissions.module.css';

export async function generateMetadata() {
  const settings = await getSettings();
  return buildMetadata({
    title: `Admissions ${text(settings, 'admissionSession', '')}`.trim(),
    description: text(settings, 'page_admissions_subtitle'),
    path: '/admissions',
  });
}

export default async function AdmissionsPage() {
  const settings = await getSettings();

  const steps = toPairs(settings.admissions_steps_items);
  const documents = toList(settings.admissions_docs_items);

  // The API builds this block; fall back to the bundled copy when it is absent.
  const admissionBlock = {
    heading: `Admissions Open ${text(settings, 'admissionSession', '')}`.trim(),
    description: text(settings, 'admission_description', admission.description),
    points: toList(settings.admission_points).length
      ? toList(settings.admission_points)
      : admission.points,
  };

  return (
    <>
      <PageHeader
        title={`Admissions ${text(settings, 'admissionSession', '')}`.trim()}
        subtitle={text(settings, 'page_admissions_subtitle')}
        breadcrumbs={[{ label: 'Admissions' }]}
      />

      {steps.length > 0 ? (
        <section className="section">
          <div className="container">
            <SectionIntro
              tag={text(settings, 'admissions_steps_tag', 'How It Works')}
              title={text(settings, 'admissions_steps_title', 'How Admission Works')}
              description={text(settings, 'admissions_steps_description')}
            />

            <ol className={styles.steps}>
              {steps.map((step, index) => (
                <Reveal key={step.id} as="li" delay={Math.min(index, 4)} className={styles.step}>
                  <span className={styles.number}>{index + 1}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      <section className="section bg-sky">
        <div className={`container ${styles.split}`}>
          <AdmissionCard admission={admissionBlock} settings={settings} />

          <Reveal delay={1} className={styles.formCard}>
            <h3>{text(settings, 'admissions_form_heading', 'Admission Enquiry')}</h3>
            <p className={styles.formIntro}>{text(settings, 'admissions_form_intro')}</p>
            <EnquiryForm settings={settings} />
          </Reveal>
        </div>
      </section>

      {documents.length > 0 ? (
        <section className="section bg-white">
          <div className="container">
            <SectionIntro
              tag={text(settings, 'admissions_docs_tag', 'Documents')}
              title={text(settings, 'admissions_docs_title', 'What to Bring')}
            />
            <ul className={styles.docs}>
              {documents.map((document) => (
                <li key={document}>{document}</li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </>
  );
}
