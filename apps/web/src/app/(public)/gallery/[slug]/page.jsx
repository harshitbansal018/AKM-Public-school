import { notFound } from 'next/navigation';
import { getAlbumBySlug } from '@/lib/serverApi';
import { formatLongDate } from '@/lib/format';
import { buildMetadata } from '@/lib/seo';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import Button from '@/components/ui/Button/Button';
import AlbumViewer from './AlbumViewer';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const album = await getAlbumBySlug(slug);

  if (!album) return buildMetadata({ title: 'Album not found', path: `/gallery/${slug}` });

  return buildMetadata({
    title: album.title,
    description: album.description,
    path: `/gallery/${slug}`,
    image: album.coverImage || undefined,
  });
}

export default async function AlbumPage({ params }) {
  const { slug } = await params;
  const album = await getAlbumBySlug(slug);

  if (!album) notFound();

  const images = album.images ?? [];

  return (
    <>
      <PageHeader
        title={album.title}
        subtitle={
          album.eventDate ? `${album.description} · ${formatLongDate(album.eventDate)}` : album.description
        }
        breadcrumbs={[{ label: 'Gallery', href: '/gallery' }, { label: album.title }]}
      />

      <section className="section">
        <div className="container">
          {images.length === 0 ? (
            <EmptyState
              icon="🖼️"
              title="Photos coming soon"
              description="This album has been created but no photos have been uploaded yet."
              action={<Button href="/gallery" variant="outline">Back to gallery</Button>}
            />
          ) : (
            <AlbumViewer images={images} albumTitle={album.title} />
          )}
        </div>
      </section>
    </>
  );
}
