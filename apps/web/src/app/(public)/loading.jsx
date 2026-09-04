import Skeleton from '@/components/ui/Skeleton/Skeleton';

/** Shown while a public page's server data resolves. */
export default function Loading() {
  return (
    <div className="container section" aria-busy="true" aria-label="Loading page">
      <Skeleton width="140px" height={22} />
      <div style={{ height: 18 }} />
      <Skeleton width="60%" height={44} />
      <div style={{ height: 28 }} />
      <Skeleton height={14} />
      <div style={{ height: 10 }} />
      <Skeleton height={14} />
      <div style={{ height: 10 }} />
      <Skeleton width="80%" height={14} />
      <div style={{ height: 40 }} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 18,
        }}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} height={180} radius="var(--radius-md)" />
        ))}
      </div>
    </div>
  );
}
