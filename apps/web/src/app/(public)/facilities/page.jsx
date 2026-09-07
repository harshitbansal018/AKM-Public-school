import { getFacilities, getSettings } from '@/lib/serverApi';
import { buildMetadata } from '@/lib/seo';
import { text } from '@/lib/content';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
import SectionIntro from '@/components/ui/SectionIntro/SectionIntro';
import FacilityGrid from '@/components/home/FacilityGrid/FacilityGrid';
import Deco from '@/components/layout/Deco/Deco';
import Button from '@/components/ui/Button/Button';

export async function generateMetadata() {
  const settings = await getSettings();
  return buildMetadata({
    title: text(settings, 'page_facilities_title', 'Campus & Facilities'),
    description: text(settings, 'page_facilities_subtitle'),
    path: '/facilities',
  });
}

export default async function FacilitiesPage() {
  const [facilities, settings] = await Promise.all([getFacilities(), getSettings()]);

  return (
    <>
      <PageHeader
        title={text(settings, 'page_facilities_title', 'Campus & Facilities')}
        subtitle={text(settings, 'page_facilities_subtitle')}
        breadcrumbs={[{ label: 'Campus' }]}
      />

      <section className="section">
        <Deco shape="ring" motion="spin" size={130} style={{ bottom: '6%', left: '3%' }} />
        <div className="container">
          <SectionIntro
            tag={text(settings, 'facilities_main_tag', 'On Campus')}
            title={text(settings, 'facilities_main_title', 'Everything a School Day Needs')}
            description={text(settings, 'facilities_main_description')}
          />
          <FacilityGrid facilities={facilities} />
        </div>
      </section>

      <section className="section bg-sky">
        <div className="container">
          <SectionIntro
            tag={text(settings, 'facilities_visit_tag', 'Visit Us')}
            title={text(settings, 'facilities_visit_title', 'See It for Yourself')}
            description={text(settings, 'facilities_visit_description')}
          />
          <div style={{ textAlign: 'center' }}>
            <Button href="/contact">Plan a Visit</Button>
          </div>
        </div>
      </section>
    </>
  );
}
