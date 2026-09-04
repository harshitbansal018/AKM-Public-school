import { getAcademicStages, getStreams } from '@/lib/serverApi';
import { buildMetadata } from '@/lib/seo';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
import SectionIntro from '@/components/ui/SectionIntro/SectionIntro';
import StageGrid from '@/components/home/StageGrid/StageGrid';
import StreamGrid from '@/components/home/StreamGrid/StreamGrid';
import Button from '@/components/ui/Button/Button';

export const metadata = buildMetadata({
  title: 'Academics',
  description:
    'HPBOSE curriculum from Nursery to Class 12, with Science (Medical), Science (Non-Medical) and Arts streams in Classes 11 and 12.',
  path: '/academics',
});

export default async function AcademicsPage() {
  const [stages, streams] = await Promise.all([getAcademicStages(), getStreams()]);

  return (
    <>
      <PageHeader
        title="Academics"
        subtitle="A structured HPBOSE journey — from playful early learning to board exam preparation."
        breadcrumbs={[{ label: 'Academics' }]}
      />

      <section className="section">
        <div className="container">
          <SectionIntro
            tag="Learning Stages"
            title="One School, Every Learning Stage"
            description="Each stage builds on the one before it, so nothing is rushed and nothing is skipped."
          />
          <StageGrid stages={stages} />
        </div>
      </section>

      <section className="section bg-sky">
        <div className="container">
          <SectionIntro
            tag="Classes 11 & 12"
            title="Choose Your Stream"
            description="Students study subjects prescribed by HPBOSE for their selected stream, in English or Hindi medium."
          />
          <StreamGrid streams={streams} />
        </div>
      </section>

      <section className="section bg-white">
        <div className="container">
          <SectionIntro
            tag="Medium of Instruction"
            title="English and Hindi, Side by Side"
            description="Parents choose the medium at the time of admission. Both follow the same HPBOSE syllabus and sit the same board examinations."
          />
          <div style={{ textAlign: 'center' }}>
            <Button href="/admissions">Apply for Admission</Button>
          </div>
        </div>
      </section>
    </>
  );
}
