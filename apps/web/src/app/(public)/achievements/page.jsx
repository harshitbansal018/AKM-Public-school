import { getAchievements, getSettings } from '@/lib/serverApi';
import { buildMetadata } from '@/lib/seo';
import { text } from '@/lib/content';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
import SectionIntro from '@/components/ui/SectionIntro/SectionIntro';
import AchievementGrid from '@/components/home/AchievementGrid/AchievementGrid';
import EmptyState from '@/components/ui/EmptyState/EmptyState';

export async function generateMetadata() {
  const settings = await getSettings();
  return buildMetadata({
    title: text(settings, 'page_achievements_title', 'Results & Toppers'),
    description: text(settings, 'page_achievements_subtitle'),
    path: '/achievements',
  });
}

export default async function AchievementsPage() {
  const [achievements, settings] = await Promise.all([getAchievements(), getSettings()]);

  // Newest year first, so the current batch always leads the page.
  const byYear = achievements.reduce((groups, item) => {
    const year = item.year || 'Other';
    (groups[year] ||= []).push(item);
    return groups;
  }, {});
  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));

  return (
    <>
      <PageHeader
        title={text(settings, 'page_achievements_title', 'Results & Toppers')}
        subtitle={text(settings, 'page_achievements_subtitle')}
        breadcrumbs={[{ label: 'Achievements' }]}
      />

      {years.length === 0 ? (
        <section className="section">
          <div className="container">
            <EmptyState
              icon="🏆"
              title={text(settings, 'achievements_empty_title', 'No achievements published yet')}
              description={text(settings, 'achievements_empty_description')}
            />
          </div>
        </section>
      ) : (
        years.map((year, index) => (
          <section key={year} className={`section ${index % 2 === 0 ? '' : 'bg-white'}`}>
            <div className="container">
              <SectionIntro
                tag={`Session ${year}`}
                title={text(settings, 'achievements_section_title', 'Our Proud Moments')}
              />
              <AchievementGrid achievements={byYear[year]} />
            </div>
          </section>
        ))
      )}
    </>
  );
}
