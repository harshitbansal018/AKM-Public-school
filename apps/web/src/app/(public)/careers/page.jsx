import { getSettings } from '@/lib/serverApi';
import { buildMetadata } from '@/lib/seo';
import { text, toList, toPairs } from '@/lib/content';
import { toTelHref } from '@/lib/format';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
import SectionIntro from '@/components/ui/SectionIntro/SectionIntro';
import Reveal from '@/components/ui/Reveal/Reveal';
import LineIcon from '@/components/ui/LineIcon/LineIcon';
import JobApplicationForm from '@/components/forms/JobApplicationForm/JobApplicationForm';
import styles from './careers.module.css';

/**
 * One icon per application step, in order — the process is a fixed sequence,
 * so the icon follows the position rather than being stored with the text.
 */
const STEP_ICONS = ['documents', 'briefcase', 'check', 'users'];

export async function generateMetadata() {
  const settings = await getSettings();
  return buildMetadata({
    title: text(settings, 'page_careers_title', 'Careers'),
    description: text(settings, 'page_careers_subtitle'),
    path: '/careers',
  });
}

/**
 * Careers page. Every word on it comes from Website content → Careers page;
 * a section whose heading or list is left blank simply does not appear.
 */
export default async function CareersPage() {
  const settings = await getSettings();

  const reasons = toPairs(settings.careers_reasons_items);
  const steps = toPairs(settings.careers_steps_items);
  const positions = toList(settings.careers_positions);
  const contactHeading = text(settings, 'careers_contact_heading');

  return (
    <>
      <PageHeader
        title={text(settings, 'page_careers_title', 'Careers')}
        subtitle={text(settings, 'page_careers_subtitle')}
        breadcrumbs={[{ label: text(settings, 'page_careers_title', 'Careers') }]}
      />

      {reasons.length > 0 ? (
        <section className="section">
          <div className="container">
            <SectionIntro
              tag={text(settings, 'careers_reasons_tag')}
              title={text(settings, 'careers_reasons_title')}
              description={text(settings, 'careers_reasons_description')}
            />
            <ul className={styles.reasons}>
              {reasons.map((reason, index) => (
                <Reveal key={reason.id} as="li" delay={Math.min(index, 4)} className={styles.reason}>
                  <span className={styles.reasonIndex}>{String(index + 1).padStart(2, '0')}</span>
                  <h3>{reason.title}</h3>
                  {reason.description ? <p>{reason.description}</p> : null}
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {steps.length > 0 ? (
        <section className="section bg-sky">
          <div className="container">
            <SectionIntro
              tag={text(settings, 'careers_steps_tag')}
              title={text(settings, 'careers_steps_title')}
              description={text(settings, 'careers_steps_description')}
            />
            <ol className={styles.steps}>
              {steps.map((step, index) => {
                const icon = STEP_ICONS[index];
                return (
                  <Reveal key={step.id} as="li" delay={Math.min(index, 4)} className={styles.step}>
                    <span className={styles.stepNumber}>{index + 1}</span>
                    {icon ? (
                      <span className={styles.stepIcon}>
                        <LineIcon name={icon} size={26} />
                      </span>
                    ) : null}
                    <h3>{step.title}</h3>
                    {step.description ? <p>{step.description}</p> : null}
                  </Reveal>
                );
              })}
            </ol>
          </div>
        </section>
      ) : null}

      <section className="section bg-white" id="apply">
        <div className={`container ${styles.split}`}>
          <div className={styles.aside}>
            {positions.length > 0 ? (
              <Reveal className={styles.positionsCard}>
                {text(settings, 'careers_positions_tag') ? (
                  <span className={styles.asideTag}>{text(settings, 'careers_positions_tag')}</span>
                ) : null}
                <h3>{text(settings, 'careers_positions_title', 'Open positions')}</h3>
                <ul className={styles.positions}>
                  {positions.map((title) => (
                    <li key={title}>{title}</li>
                  ))}
                </ul>
                {text(settings, 'careers_positions_note') ? (
                  <p className={styles.asideNote}>{text(settings, 'careers_positions_note')}</p>
                ) : null}
              </Reveal>
            ) : null}

            {contactHeading ? (
              <Reveal delay={1} className={styles.contactCard}>
                <h3>{contactHeading}</h3>
                {text(settings, 'careers_contact_text') ? <p>{text(settings, 'careers_contact_text')}</p> : null}
                <p className={styles.contactLines}>
                  {settings.phonePrimary ? (
                    <a href={toTelHref(settings.phonePrimary)}>{settings.phonePrimary}</a>
                  ) : null}
                  {settings.email ? <a href={`mailto:${settings.email}`}>{settings.email}</a> : null}
                  {settings.timingsShort ? <span>{settings.timingsShort}</span> : null}
                </p>
              </Reveal>
            ) : null}
          </div>

          <Reveal delay={1} className={styles.formCard}>
            <h2>{text(settings, 'careers_form_heading', 'Apply for a position')}</h2>
            {text(settings, 'careers_form_intro') ? (
              <p className={styles.formIntro}>{text(settings, 'careers_form_intro')}</p>
            ) : null}
            <JobApplicationForm
              positions={positions}
              privacyNote={text(settings, 'careers_form_privacy')}
              successTitle={text(settings, 'careers_success_title', 'Application received')}
              successText={text(settings, 'careers_success_text')}
            />
          </Reveal>
        </div>
      </section>
    </>
  );
}
