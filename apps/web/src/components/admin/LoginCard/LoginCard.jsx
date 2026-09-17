import Link from 'next/link';
import Image from 'next/image';
import LoginForm from '@/components/forms/LoginForm/LoginForm';
import styles from './LoginCard.module.css';

/**
 * The full-screen sign-in card. The admin panel and the teacher portal differ
 * only in their branding line, so both login pages render this.
 */
export default function LoginCard({ brand, tagline, intro }) {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <Image src="/icon.png" alt="" width={54} height={54} />
          <div>
            <b>{brand}</b>
            <small>{tagline}</small>
          </div>
        </div>

        <h1 className={styles.heading}>Sign in</h1>
        <p className={styles.sub}>{intro}</p>

        <LoginForm />

        <Link href="/" className={styles.back}>
          ← Back to the website
        </Link>
      </div>
    </main>
  );
}
