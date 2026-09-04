import Link from 'next/link';

/**
 * 404 page. Deliberately self-contained — a missing route may sit outside the
 * (public) group, so this cannot rely on the site chrome being present.
 */
export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 22px',
        background: 'linear-gradient(180deg, var(--sky-soft) 0%, var(--cream) 100%)',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: 460 }}>
        <div style={{ fontSize: '3.4rem', marginBottom: 8 }} aria-hidden="true">
          🧭
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.6rem)', marginBottom: 10 }}>
          Page Not Found
        </h1>
        <p style={{ color: 'var(--muted)', marginBottom: 26 }}>
          The page you were looking for has moved or never existed. The notice board and gallery are
          good places to pick things back up.
        </p>
        <div
          style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <Link href="/" className="btn btn-primary">
            Back to Home
          </Link>
          <Link href="/notices" className="btn btn-outline">
            News &amp; Notices
          </Link>
        </div>
      </div>
    </main>
  );
}
