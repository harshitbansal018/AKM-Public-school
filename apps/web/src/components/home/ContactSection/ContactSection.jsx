import { toTelHref } from '@/lib/format';
import Reveal from '@/components/ui/Reveal/Reveal';
import SchoolMap from '@/components/ui/SchoolMap/SchoolMap';
import EnquiryForm from '@/components/forms/EnquiryForm/EnquiryForm';
import styles from './ContactSection.module.css';

/** School details on the left, admission enquiry form on the right. */
export default function ContactSection({ settings }) {
  return (
    <div className={styles.grid}>
      <Reveal className={styles.card}>
        <h3>School Information</h3>

        <div className={styles.line}>
          <span className={styles.icon} aria-hidden="true">
            📍
          </span>
          <div>
            <b>Address</b>
            <span>{settings.addressFull}</span>
          </div>
        </div>

        <div className={styles.line}>
          <span className={styles.icon} aria-hidden="true">
            📞
          </span>
          <div>
            <b>Phone</b>
            <span>
              <a href={toTelHref(settings.phonePrimary)}>{settings.phonePrimary}</a>
              {settings.phoneSecondary ? (
                <>
                  {', '}
                  <a href={toTelHref(settings.phoneSecondary)}>{settings.phoneSecondary}</a>
                </>
              ) : null}
            </span>
          </div>
        </div>

        <div className={styles.line}>
          <span className={styles.icon} aria-hidden="true">
            ✉️
          </span>
          <div>
            <b>Email</b>
            <span>
              <a href={`mailto:${settings.email}`}>{settings.email}</a>
            </span>
          </div>
        </div>

        <div className={styles.line}>
          <span className={styles.icon} aria-hidden="true">
            🕗
          </span>
          <div>
            <b>School Timings</b>
            <span>{settings.timings}</span>
          </div>
        </div>

        <SchoolMap src={settings.mapEmbedUrl} height={220} className={styles.map} />
      </Reveal>

      <Reveal delay={1} className={styles.card}>
        <h3>Admission Enquiry Form</h3>
        <EnquiryForm settings={settings} />
      </Reveal>
    </div>
  );
}
