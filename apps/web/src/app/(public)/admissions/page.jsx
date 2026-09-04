import { getSettings } from '@/lib/serverApi';
import { admission } from '@/data/fallback';
import { buildMetadata } from '@/lib/seo';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
import SectionIntro from '@/components/ui/SectionIntro/SectionIntro';
import Reveal from '@/components/ui/Reveal/Reveal';
import AdmissionCard from '@/components/home/AdmissionCard/AdmissionCard';
import EnquiryForm from '@/components/forms/EnquiryForm/EnquiryForm';
import styles from './admissions.module.css';

export const metadata = buildMetadata({
  title: 'Admissions',
  description:
    'Admissions open for Nursery to Class 12 at AKM Public Sr. Sec. School. Simple process, English and Hindi medium, affordable fees.',
  path: '/admissions',
});

const STEPS = [
  {
    id: 1,
    title: 'Send an enquiry',
    description:
      'Fill the form on this page, call the school office, or send a WhatsApp message. We will call you back.',
  },
  {
    id: 2,
    title: 'Visit the campus',
    description:
      'Come and see the classrooms and labs, and meet the class teacher for the class you are applying to.',
  },
  {
    id: 3,
    title: 'Submit documents',
    description:
      'Birth certificate, previous report card, transfer certificate (if applicable) and two passport photographs.',
  },
  {
    id: 4,
    title: 'Confirm the seat',
    description:
      'Pay the admission fee at the office and collect the fee receipt, book list and uniform details.',
  },
];

export default async function AdmissionsPage() {
  const settings = await getSettings();

  return (
    <>
      <PageHeader
        title={`Admissions ${settings.admissionSession}`}
        subtitle="Open for Nursery to Class 12, in English and Hindi medium."
        breadcrumbs={[{ label: 'Admissions' }]}
      />

      <section className="section">
        <div className="container">
          <SectionIntro
            tag="How It Works"
            title="Four Steps, Start to Finish"
            description="No agents, no queues — parents deal directly with the school office."
          />

          <ol className={styles.steps}>
            {STEPS.map((step, index) => (
              <Reveal
                key={step.id}
                as="li"
                delay={Math.min(index, 4)}
                className={styles.step}
              >
                <span className={styles.number}>{step.id}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="section bg-sky">
        <div className={`container ${styles.split}`}>
          <AdmissionCard admission={admission} settings={settings} />

          <Reveal delay={1} className={styles.formCard}>
            <h3>Admission Enquiry</h3>
            <p className={styles.formIntro}>
              Leave your number and the class you are applying for. Someone from the office will
              call you, usually within one working day.
            </p>
            <EnquiryForm settings={settings} />
          </Reveal>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container">
          <SectionIntro tag="Documents" title="What to Bring" />
          <ul className={styles.docs}>
            <li>Birth certificate (original + one photocopy)</li>
            <li>Previous school report card / marksheet</li>
            <li>Transfer certificate, for students joining from another school</li>
            <li>Two recent passport-size photographs of the student</li>
            <li>Aadhaar card of the student and one parent</li>
            <li>Caste or category certificate, where applicable</li>
          </ul>
        </div>
      </section>
    </>
  );
}
