import { getGalleryAlbums } from '@/lib/serverApi';
import { buildMetadata } from '@/lib/seo';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
import GalleryGrid from '@/components/home/GalleryGrid/GalleryGrid';
import EmptyState from '@/components/ui/EmptyState/EmptyState';

export const metadata = buildMetadata({
  title: 'Gallery',
  description:
    'Photos of the campus, classrooms, sports day and cultural events at AKM Public Sr. Sec. School.',
  path: '/gallery',
});

export default async function GalleryPage() {
  const albums = await getGalleryAlbums();

  return (
    <>
      <PageHeader
        title="Gallery"
        subtitle="Life at AKM — campus, classrooms, events and student activities."
        breadcrumbs={[{ label: 'Gallery' }]}
      />

      <section className="section">
        <div className="container">
          {albums.length === 0 ? (
            <EmptyState
              icon="📷"
              title="No albums yet"
              description="Photo albums will appear here once the school office uploads them."
            />
          ) : (
            <GalleryGrid albums={albums} />
          )}
        </div>
      </section>
    </>
  );
}
