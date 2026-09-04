import { getAchievements } from '@/lib/serverApi';
import { buildMetadata } from '@/lib/seo';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
import SectionIntro from '@/components/ui/SectionIntro/SectionIntro';
import AchievementGrid from '@/components/home/AchievementGrid/AchievementGrid';
import EmptyState from '@/components/ui/EmptyState/EmptyState';

export const metadata = buildMetadata({
  title: 'Results & Toppers',
  description:
    'HPBOSE board toppers, sports victories and cultural wins from AKM Public Sr. Sec. School.',
  path: '/achievements',
});

export default async function AchievementsPage() {
  const achievements = await getAchievements();

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
        title="Results & Toppers"
        subtitle="Board results, competition wins and the students behind them."
        breadcrumbs={[{ label: 'Achievements' }]}
      />

      {years.length === 0 ? (
        <section className="section">
          <div className="container">
            <EmptyState
              icon="🏆"
              title="No achievements published yet"
              description="Results and toppers will appear here as soon as they are announced."
            />
          </div>
        </section>
      ) : (
        years.map((year, index) => (
          <section key={year} className={`section ${index % 2 === 0 ? '' : 'bg-white'}`}>
            <div className="container">
              <SectionIntro tag={`Session ${year}`} title="Our Proud Moments" />
              <AchievementGrid achievements={byYear[year]} />
            </div>
          </section>
        ))
      )}
    </>
  );
}
