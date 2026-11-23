import Button from '@/components/ui/Button/Button';
import { cmsHref } from '@/constants/navLinks';
import styles from './AdmissionCard.module.css';

/** Royal-blue admissions call-to-action panel. */
export default function AdmissionCard({ admission, settings }) {
  return (
    <div className={styles.card}>
      <h2>{admission.heading}</h2>
      <p>{admission.description}</p>
      <ul>
        {admission.points.map((point) => <li key={point}>{point}</li>)}
      </ul>
      <div className={styles.actions}>
        <Button href={cmsHref(settings.admission_cta_href, '/contact')}>
          {settings.admission_cta_label || 'Enquire Now'}
        </Button>
        {settings.whatsapp ? (
          <Button href={`https://wa.me/${settings.whatsapp}`} variant="whatsapp">
            💬 {settings.admission_whatsapp_label || 'WhatsApp Us'}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
