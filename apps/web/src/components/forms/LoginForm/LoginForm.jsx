'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_ENABLED } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input/Input';
import Spinner from '@/components/ui/Spinner/Spinner';
import styles from './LoginForm.module.css';

/** Sign-in form for whichever portal's AuthProvider it sits inside. */
export default function LoginForm() {
  const router = useRouter();
  const { login, portal } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    const nextErrors = {};
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) nextErrors.email = 'Enter a valid email address';
    if (!password) nextErrors.password = 'Enter your password';
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }
    setFieldErrors({});

    if (!API_ENABLED) {
      setError('The backend is not built yet, so sign-in is not available.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      router.replace(`/${portal}/dashboard`);
    } catch (err) {
      const apiFieldErrors = Object.fromEntries(
        (err.details ?? [])
          .filter(({ field }) => field === 'email' || field === 'password')
          .map(({ field, message }) => [field, message])
      );
      if (Object.keys(apiFieldErrors).length > 0) setFieldErrors(apiFieldErrors);
      else setError(err.message || 'Sign in failed. Check your email and password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <Input
        id="email"
        name="email"
        type="email"
        label="Email"
        placeholder="you@akmpublicschool.in"
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
          setFieldErrors((current) => ({ ...current, email: undefined }));
        }}
        error={fieldErrors.email}
        autoComplete="username"
        required
      />

      <Input
        id="password"
        name="password"
        type="password"
        label="Password"
        placeholder="Your password"
        value={password}
        onChange={(event) => {
          setPassword(event.target.value);
          setFieldErrors((current) => ({ ...current, password: undefined }));
        }}
        error={fieldErrors.password}
        autoComplete="current-password"
        required
      />

      <Link href={`/${portal}/forgot-password`} className={styles.link}>
        Forgot password?
      </Link>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? (
          <>
            <Spinner size="xs" /> Signing in…
          </>
        ) : (
          'Sign In'
        )}
      </button>
    </form>
  );
}
