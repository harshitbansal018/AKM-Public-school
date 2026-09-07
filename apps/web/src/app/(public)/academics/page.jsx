import { getAcademicStages, getStreams, getSettings } from '@/lib/serverApi';
import { buildMetadata } from '@/lib/seo';
import { text } from '@/lib/content';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
import SectionIntro from '@/components/ui/SectionIntro/SectionIntro';
import StageGrid from '@/components/home/StageGrid/StageGrid';
import StreamGrid from '@/components/home/StreamGrid/StreamGrid';
import Button from '@/components/ui/Button/Button';

export async function generateMetadata() {
  const settings = await getSettings();
  return buildMetadata({
    title: text(settings, 'page_academics_title', 'Academics'),
    description: text(settings, 'page_academics_subtitle'),
    path: '/academics',
  });
}

export default async function AcademicsPage() {
  const [stages, streams, settings] = await Promise.all([
    getAcademicStages(),
    getStreams(),
    getSettings(),
  ]);

  return (
    <>
      <PageHeader
        title={text(settings, 'page_academics_title', 'Academics')}
        subtitle={text(settings, 'page_academics_subtitle')}
        breadcrumbs={[{ label: 'Academics' }]}
      />

      <section className="section">
        <div className="container">
          <SectionIntro
            tag={text(settings, 'academics_stages_tag', 'Learning Stages')}
            title={text(settings, 'academics_stages_title', 'One School, Every Learning Stage')}
            description={text(settings, 'academics_stages_description')}
          />
          <StageGrid stages={stages} />
        </div>
      </section>

      <section className="section bg-sky">
        <div className="container">
          <SectionIntro
            tag={text(settings, 'academics_streams_tag', 'Classes 11 & 12')}
            title={text(settings, 'academics_streams_title', 'Choose Your Stream')}
            description={text(settings, 'academics_streams_description')}
          />
          <StreamGrid streams={streams} />
        </div>
      </section>

      <section className="section bg-white">
        <div className="container">
          <SectionIntro
            tag={text(settings, 'academics_medium_tag', 'Medium of Instruction')}
            title={text(settings, 'academics_medium_title', 'English and Hindi, Side by Side')}
            description={text(settings, 'academics_medium_description')}
          />
          <div style={{ textAlign: 'center' }}>
            <Button href="/admissions">Apply for Admission</Button>
          </div>
        </div>
      </section>
    </>
  );
}
