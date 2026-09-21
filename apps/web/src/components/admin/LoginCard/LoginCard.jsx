import Link from 'next/link';
import Image from 'next/image';
import LoginForm from '@/components/forms/LoginForm/LoginForm';
import styles from './LoginCard.module.css';

/**
 * The full-screen sign-in card. The three portals differ only in their
 * branding line, so every login page renders this — and the forgot / reset
 * password pages reuse it with their own heading and form as `children`.
 */
export default function LoginCard({ brand, tagline, intro, heading = 'Sign in', children }) {
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

        <h1 className={styles.heading}>{heading}</h1>
        <p className={styles.sub}>{intro}</p>

        {children ?? <LoginForm />}

        <Link href="/" className={styles.back}>
          ← Back to the website
        </Link>
      </div>
    </main>
  );
}
