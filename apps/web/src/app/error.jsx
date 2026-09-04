'use client';

import { useEffect } from 'react';

/**
 * Route-level error boundary. `reset()` re-renders the segment, which is enough
 * to recover from a transient API failure.
 */
export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('[route error]', error);
  }, [error]);

  return (
    <main
      style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 22px',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: 460 }}>
        <div style={{ fontSize: '3rem', marginBottom: 8 }} aria-hidden="true">
          ⚠️
        </div>
        <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', marginBottom: 10 }}>
          Something went wrong
        </h1>
        <p style={{ color: 'var(--muted)', marginBottom: 26 }}>
          This page could not be loaded. Please try again — if it keeps happening, contact the
          school office directly.
        </p>
        <button type="button" className="btn btn-primary" onClick={reset}>
          Try Again
        </button>
      </div>
    </main>
  );
}
