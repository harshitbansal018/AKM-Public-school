import { getGalleryAlbums, getSettings } from '@/lib/serverApi';
import { buildMetadata } from '@/lib/seo';
import { text } from '@/lib/content';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
import GalleryGrid from '@/components/home/GalleryGrid/GalleryGrid';
import EmptyState from '@/components/ui/EmptyState/EmptyState';

export async function generateMetadata() {
  const settings = await getSettings();
  return buildMetadata({
    title: text(settings, 'page_gallery_title', 'Gallery'),
    description: text(settings, 'page_gallery_subtitle'),
    path: '/gallery',
  });
}

export default async function GalleryPage() {
  const [albums, settings] = await Promise.all([getGalleryAlbums(), getSettings()]);

  return (
    <>
      <PageHeader
        title={text(settings, 'page_gallery_title', 'Gallery')}
        subtitle={text(settings, 'page_gallery_subtitle')}
        breadcrumbs={[{ label: 'Gallery' }]}
      />

      <section className="section">
        <div className="container">
          {albums.length === 0 ? (
            <EmptyState
              icon="📷"
              title={text(settings, 'gallery_empty_title', 'No albums yet')}
              description={text(settings, 'gallery_empty_description')}
            />
          ) : (
            <GalleryGrid albums={albums} />
          )}
        </div>
      </section>
    </>
  );
}
