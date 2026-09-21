'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiPost } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input/Input';
import Spinner from '@/components/ui/Spinner/Spinner';
import styles from '@/components/forms/LoginForm/LoginForm.module.css';

/**
 * "Forgot password": asks for the email and always confirms the same way, so
 * the form cannot be used to check which addresses have an account. The
 * portal comes from the surrounding AuthProvider, so one form serves all three.
 */
export function ForgotPasswordForm() {
  const { portal } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await apiPost(`/${portal}/auth/forgot-password`, { email: email.trim() });
      setSent(true);
    } catch (err) {
      setError(err.message || 'Could not send the reset email. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className={styles.form}>
        <p className={styles.notice} role="status">
          If an account exists for <b>{email.trim()}</b>, a reset link is on its way. It works for 60 minutes —
          check your spam folder if it does not arrive.
        </p>
        <Link href={`/${portal}/login`} className="btn btn-outline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <Input
        id="email"
        name="email"
        type="email"
        label="Email"
        placeholder="The email you sign in with"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        autoComplete="username"
        required
      />

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" className="btn btn-primary" disabled={submitting || !email.trim()}>
        {submitting ? (
          <>
            <Spinner size="xs" /> Sending…
          </>
        ) : (
          'Send reset link'
        )}
      </button>

      <Link href={`/${portal}/login`} className={styles.link}>
        ← Back to sign in
      </Link>
    </form>
  );
}

/** "Reset password": the page the emailed link opens; the token rides in the URL. */
export function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { portal } = useAuth();
  const token = params.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('The two passwords do not match');
      return;
    }
    setSubmitting(true);
    try {
      await apiPost(`/${portal}/auth/reset-password`, { token, password, confirmPassword: confirm });
      setDone(true);
      setTimeout(() => router.replace(`/${portal}/login`), 2500);
    } catch (err) {
      setError(err.message || 'Could not reset the password. Please ask for a new link.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className={styles.form}>
        <p className={styles.error} role="alert">
          This reset link is incomplete. Open the link from the email again, or ask for a new one.
        </p>
        <Link href={`/${portal}/forgot-password`} className="btn btn-outline">
          Request a new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className={styles.form}>
        <p className={styles.notice} role="status">
          Your password has been changed. Taking you to sign in…
        </p>
        <Link href={`/${portal}/login`} className="btn btn-primary">
          Sign in now
        </Link>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <Input
        id="password"
        name="password"
        type="password"
        label="New password"
        placeholder="At least 8 characters, with a letter and a number"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="new-password"
        required
      />
      <Input
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        label="Confirm new password"
        placeholder="Type it again"
        value={confirm}
        onChange={(event) => setConfirm(event.target.value)}
        autoComplete="new-password"
        required
      />

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" className="btn btn-primary" disabled={submitting || !password || !confirm}>
        {submitting ? (
          <>
            <Spinner size="xs" /> Saving…
          </>
        ) : (
          'Set new password'
        )}
      </button>
    </form>
  );
}
