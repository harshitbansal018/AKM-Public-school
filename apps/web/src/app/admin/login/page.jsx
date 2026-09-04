import Link from 'next/link';
import Image from 'next/image';
import LoginForm from '@/components/forms/LoginForm/LoginForm';
import styles from './login.module.css';

export const metadata = {
  title: 'Sign In — AKM Admin',
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <Image src="/icon.png" alt="" width={54} height={54} />
          <div>
            <b>AKM Admin</b>
            <small>Content Manager</small>
          </div>
        </div>

        <h1 className={styles.heading}>Sign in</h1>
        <p className={styles.sub}>Use the account created for you by the school administrator.</p>

        <LoginForm />

        <Link href="/" className={styles.back}>
          ← Back to the website
        </Link>
      </div>
    </main>
  );
}
