import { getHomeData, getSettings } from '@/lib/serverApi';
import { buildMetadata } from '@/lib/seo';
import { text, toPairs, toParagraphs } from '@/lib/content';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
import SectionIntro from '@/components/ui/SectionIntro/SectionIntro';
import Reveal from '@/components/ui/Reveal/Reveal';
import StatsCounter from '@/components/home/StatsCounter/StatsCounter';
import PrincipalMessage from '@/components/home/PrincipalMessage/PrincipalMessage';
import StageGrid from '@/components/home/StageGrid/StageGrid';
import styles from './about.module.css';

export async function generateMetadata() {
  const settings = await getSettings();
  return buildMetadata({
    title: text(settings, 'page_about_title', 'About Us'),
    description: text(settings, 'page_about_subtitle'),
    path: '/about',
  });
}

export default async function AboutPage() {
  const [data, settings] = await Promise.all([getHomeData(), getSettings()]);

  const paragraphs = toParagraphs(settings.about_intro_body);
  const values = toPairs(settings.about_values_items);

  return (
    <>
      <PageHeader
        title={text(settings, 'page_about_title', 'About Our School')}
        subtitle={text(settings, 'page_about_subtitle')}
        breadcrumbs={[{ label: 'About' }]}
      />

      <section className="section">
        <div className={`container ${styles.intro}`}>
          <Reveal>
            <h2>{text(settings, 'about_intro_heading', 'Who We Are')}</h2>
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </Reveal>

          {values.length > 0 ? (
            <Reveal delay={1} className={styles.values}>
              <h3>{text(settings, 'about_values_heading', 'What We Stand For')}</h3>
              <ul>
                {values.map((value) => (
                  <li key={value.id}>
                    <b>{value.title}</b>
                    {value.description}
                  </li>
                ))}
              </ul>
            </Reveal>
          ) : null}
        </div>
      </section>

      <StatsCounter stats={data.stats} />

      <PrincipalMessage principal={data.principal} />

      <section className="section">
        <div className="container">
          <SectionIntro
            tag={text(settings, 'about_structure_tag', 'Academic Structure')}
            title={text(settings, 'about_structure_title', 'Every Stage, Under One Roof')}
            description={text(settings, 'about_structure_description')}
          />
          <StageGrid stages={data.academicStages} />
        </div>
      </section>
    </>
  );
}
