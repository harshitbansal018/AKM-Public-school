import Link from 'next/link';
import { footerQuickLinks, footerInfoLinks, footerLegalLinks } from '@/constants/navLinks';
import { toTelHref } from '@/lib/format';
import Logo from '@/components/layout/Logo/Logo';
import styles from './Footer.module.css';

export default function Footer({ settings }) {
  const mapQuery = [settings.schoolName, settings.addressFull || settings.addressShort]
    .filter(Boolean)
    .join(', ');
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.about}>
            <Logo schoolName={settings.schoolName} variant="footer" />
            <p>
              Providing quality HPBOSE education from Nursery to Class 12 in English &amp; Hindi
              medium, focused on academics, discipline and the overall growth of every student.
            </p>
          </div>

          <div>
            <h4>Quick Links</h4>
            <ul>
              {footerQuickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Information</h4>
            <ul>
              {footerInfoLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Contact</h4>
            <ul>
              <li className={styles.contactItem}>
                <span className={styles.contactIcon} aria-hidden="true">📍</span>
                <a href={mapsHref} target="_blank" rel="noreferrer">
                  {settings.addressShort}
                </a>
              </li>
              <li className={styles.contactItem}>
                <span className={styles.contactIcon} aria-hidden="true">📞</span>
                <a href={toTelHref(settings.phonePrimary)}>{settings.phonePrimary}</a>
              </li>
              <li className={styles.contactItem}>
                <span className={styles.contactIcon} aria-hidden="true">✉️</span>
                <a href={`mailto:${settings.email}`}>{settings.email}</a>
              </li>
              <li className={styles.contactItem}>
                <span className={styles.contactIcon} aria-hidden="true">🕗</span>
                <span>{settings.timingsShort}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <span>
            © {settings.copyrightYear} {settings.schoolName}. All rights reserved.
          </span>
          <span className={styles.legal}>
            {footerLegalLinks.map((link, index) => (
              <span key={link.href}>
                {index > 0 ? <span aria-hidden="true"> | </span> : null}
                <Link href={link.href}>{link.label}</Link>
              </span>
            ))}
          </span>
        </div>
      </div>
    </footer>
  );
}
