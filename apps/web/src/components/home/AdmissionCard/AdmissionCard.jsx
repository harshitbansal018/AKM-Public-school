import Button from '@/components/ui/Button/Button';
import styles from './AdmissionCard.module.css';

/** Royal-blue admissions call-to-action panel. */
export default function AdmissionCard({ admission, settings }) {
  return (
    <div className={styles.card}>
      <h2>{admission.heading}</h2>
      <p>{admission.description}</p>
      <ul>
        {admission.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
      <div className={styles.actions}>
        <Button href="/contact">Enquire Now</Button>
        <Button href={`https://wa.me/${settings.whatsapp}`} variant="whatsapp">
          💬 WhatsApp Us
        </Button>
      </div>
    </div>
  );
}
