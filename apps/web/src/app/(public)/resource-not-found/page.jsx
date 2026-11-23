import Button from '@/components/ui/Button/Button';
import PageHeader from '@/components/ui/PageHeader/PageHeader';

export const metadata = {
  title: 'Page Not Found',
  robots: { index: false, follow: false },
};

export default function ResourceNotFoundPage() {
  return (
    <>
      <PageHeader title="Page Not Found" breadcrumbs={[{ label: 'Not Found' }]} />
      <section className="section">
        <div className="container" style={{ maxWidth: 720, textAlign: 'center' }}>
          <h2>This item is no longer available</h2>
          <p style={{ margin: '12px auto 24px', color: 'var(--muted)' }}>
            The notice or gallery album may have been removed, unpublished, or its address may be incorrect.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Button href="/notices">News &amp; Notices</Button>
            <Button href="/gallery" variant="outline">Gallery</Button>
          </div>
        </div>
      </section>
    </>
  );
}
