import { getFacilities } from '@/lib/serverApi';
import { buildMetadata } from '@/lib/seo';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
import SectionIntro from '@/components/ui/SectionIntro/SectionIntro';
import FacilityGrid from '@/components/home/FacilityGrid/FacilityGrid';
import Deco from '@/components/layout/Deco/Deco';
import Button from '@/components/ui/Button/Button';

export const metadata = buildMetadata({
  title: 'Campus & Facilities',
  description:
    'Computer and IT lab, science laboratories, indoor playground and well-run classrooms at AKM Public Sr. Sec. School.',
  path: '/facilities',
});

export default async function FacilitiesPage() {
  const facilities = await getFacilities();

  return (
    <>
      <PageHeader
        title="Campus & Facilities"
        subtitle="A supportive environment where students can learn, practise and play."
        breadcrumbs={[{ label: 'Campus' }]}
      />

      <section className="section">
        <Deco shape="ring" motion="spin" size={130} style={{ bottom: '6%', left: '3%' }} />
        <div className="container">
          <SectionIntro
            tag="On Campus"
            title="Everything a School Day Needs"
            description="Facilities are shared across all classes, so even primary students get lab and computer time."
          />
          <FacilityGrid facilities={facilities} />
        </div>
      </section>

      <section className="section bg-sky">
        <div className="container">
          <SectionIntro
            tag="Visit Us"
            title="See It for Yourself"
            description="Parents are welcome to visit the campus on any working day between 8:00 AM and 2:00 PM."
          />
          <div style={{ textAlign: 'center' }}>
            <Button href="/contact">Plan a Visit</Button>
          </div>
        </div>
      </section>
    </>
  );
}
