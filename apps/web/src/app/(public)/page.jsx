import { getHomeData } from '@/lib/serverApi';
import { buildMetadata, schoolJsonLd } from '@/lib/seo';

import Deco from '@/components/layout/Deco/Deco';
import SectionIntro from '@/components/ui/SectionIntro/SectionIntro';
import Hero from '@/components/home/Hero/Hero';
import StatsCounter from '@/components/home/StatsCounter/StatsCounter';
import StageGrid from '@/components/home/StageGrid/StageGrid';
import PrincipalMessage from '@/components/home/PrincipalMessage/PrincipalMessage';
import StreamGrid from '@/components/home/StreamGrid/StreamGrid';
import FacilityGrid from '@/components/home/FacilityGrid/FacilityGrid';
import AchievementGrid from '@/components/home/AchievementGrid/AchievementGrid';
import NoticeBoard from '@/components/home/NoticeBoard/NoticeBoard';
import AdmissionCard from '@/components/home/AdmissionCard/AdmissionCard';
import GalleryGrid from '@/components/home/GalleryGrid/GalleryGrid';
import ContactSection from '@/components/home/ContactSection/ContactSection';

import styles from './home.module.css';

export const metadata = buildMetadata({ path: '/' });

/**
 * Homepage — a server component. One call to getHomeData() feeds every section,
 * so the whole page renders in a single round trip and is fully indexable.
 */
export default async function HomePage() {
  const data = await getHomeData();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schoolJsonLd()) }}
      />

      <Hero hero={data.hero} />

      <StatsCounter stats={data.stats} />

      {/* Academics */}
      <section className="section">
        <Deco shape="dot-t" motion="slow" size={110} style={{ top: '10%', right: '3%' }} />
        <div className="container">
          <SectionIntro
            tag="Our Academics"
            title="One School, Every Learning Stage"
            description="A structured HPBOSE academic journey — from playful early learning to board exam preparation."
          />
          {/* slider: sections here stay a tidy single row however many cards
              the school adds later. The full-page versions keep the grid. */}
          <StageGrid stages={data.academicStages} slider />
        </div>
      </section>

      <PrincipalMessage principal={data.principal} />

      {/* Streams */}
      <section className="section bg-sky">
        <div className="container">
          <SectionIntro
            tag="Classes 11 & 12"
            title="Choose Your Stream"
            description="Students study subjects prescribed by HPBOSE for their selected stream, in English or Hindi medium."
          />
          <StreamGrid streams={data.streams} slider />
        </div>
      </section>

      {/* Facilities */}
      <section className="section">
        <Deco shape="ring" motion="spin" size={130} style={{ bottom: '6%', left: '3%' }} />
        <div className="container">
          <SectionIntro tag="Campus & Facilities" title="A Supportive Learning Environment" />
          <FacilityGrid facilities={data.facilities} slider />
        </div>
      </section>

      {/* Achievements */}
      <section className="section bg-white">
        <div className="container">
          <SectionIntro
            tag="Achievements"
            title="Our Proud Moments"
            description="Board toppers, sports victories and cultural wins — our students shine everywhere."
          />
          <AchievementGrid achievements={data.achievements} slider />
        </div>
      </section>

      {/* Notices + admissions */}
      <section className="section bg-cream">
        <div className={`container ${styles.split}`}>
          <NoticeBoard notices={data.notices} />
          <AdmissionCard admission={data.admission} settings={data.settings} />
        </div>
      </section>

      {/* Gallery */}
      <section className="section bg-white">
        <div className="container">
          <SectionIntro
            tag="Gallery"
            title="Life at AKM"
            description="Real photos of our campus, classrooms, events and student activities."
          />
          <GalleryGrid albums={data.galleryAlbums} slider />
        </div>
      </section>

      {/* Contact */}
      <section className="section bg-sky" id="contact">
        <div className="container">
          <SectionIntro tag="Get in Touch" title="Contact & Admission Enquiry" />
          <ContactSection settings={data.settings} />
        </div>
      </section>
    </>
  );
}
