'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_ENABLED } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input/Input';
import styles from './LoginForm.module.css';

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!API_ENABLED) {
      setError('The backend is not built yet, so sign-in is not available.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      router.replace('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Sign in failed. Check your email and password.');
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
        onChange={(event) => setEmail(event.target.value)}
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
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="current-password"
        required
      />

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  );
}
