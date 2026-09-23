import Link from 'next/link';
import { toTelHref } from '@/lib/format';
import styles from './Topbar.module.css';

/** Thin navy strip above the ticker: phone, email, timings, admissions link,
 *  and the parent / teacher portal sign-in on the right. */
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
        {/* <span>🕗 {settings.timingsShort}</span> */}
        <span>
          <Link href="/admissions" className={styles.cta}>
            Admissions Open {settings.admissionSession} →
          </Link>
        </span>

        {/* Portal sign-in, kept to the far right and out of the main header. */}
        <span className={styles.logins}>
          <Link href="/parent/login" className={styles.login}>
            Parent Login
          </Link>
          <span aria-hidden="true" className={styles.divider}>
            |
          </span>
          <Link href="/teacher/login" className={styles.login}>
            Teacher Login
          </Link>
        </span>
      </div>
    </div>
  );
}
