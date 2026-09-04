import Link from 'next/link';
import { toTelHref } from '@/lib/format';
import styles from './Topbar.module.css';

/** Thin navy strip above the ticker: phone, email, timings, admissions link. */
export default function Topbar({ settings }) {
  return (
    <div className={styles.topbar}>
      <div className={`container ${styles.inner}`}>
        <span>
          📞{' '}
          <a href={toTelHref(settings.phonePrimary)} className={styles.plain}>
            {settings.phonePrimary}
          </a>
        </span>
        <span>
          ✉️{' '}
          <a href={`mailto:${settings.email}`} className={styles.plain}>
            {settings.email}
          </a>
        </span>
        <span>🕗 {settings.timingsShort}</span>
        <span>
          <Link href="/admissions" className={styles.cta}>
            Admissions Open {settings.admissionSession} →
          </Link>
        </span>
      </div>
    </div>
  );
}
