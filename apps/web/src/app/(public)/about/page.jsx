import { getHomeData } from '@/lib/serverApi';
import { buildMetadata } from '@/lib/seo';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
import SectionIntro from '@/components/ui/SectionIntro/SectionIntro';
import Reveal from '@/components/ui/Reveal/Reveal';
import StatsCounter from '@/components/home/StatsCounter/StatsCounter';
import PrincipalMessage from '@/components/home/PrincipalMessage/PrincipalMessage';
import StageGrid from '@/components/home/StageGrid/StageGrid';
import styles from './about.module.css';

export const metadata = buildMetadata({
  title: 'About Us',
  description:
    'AKM Public Sr. Sec. School is an HPBOSE-affiliated school offering English and Hindi medium education from Nursery to Class 12.',
  path: '/about',
});

export default async function AboutPage() {
  const data = await getHomeData();

  return (
    <>
      <PageHeader
        title="About Our School"
        subtitle="Quality HPBOSE education from Nursery to Class 12, in English and Hindi medium."
        breadcrumbs={[{ label: 'About' }]}
      />

      <section className="section">
        <div className={`container ${styles.intro}`}>
          <Reveal>
            <h2>Who We Are</h2>
            <p>
              AKM Public Sr. Sec. School is affiliated to the Himachal Pradesh Board of School
              Education (HPBOSE) and teaches every class from Nursery through Class 12. Families can
              choose English or Hindi medium, and senior students choose between Science (Medical),
              Science (Non-Medical) and Arts.
            </p>
            <p>
              With {data.stats[0].value}+ students and {data.stats[1].value} teachers, class sizes
              stay small enough that every child is known by name. That is the part of the school we
              are proudest of.
            </p>
          </Reveal>

          <Reveal delay={1} className={styles.values}>
            <h3>What We Stand For</h3>
            <ul>
              <li>
                <b>Academics that hold up.</b> A full HPBOSE curriculum, taught thoroughly, with
                focused board preparation in Classes 10 and 12.
              </li>
              <li>
                <b>Discipline with warmth.</b> Clear expectations, held kindly — so students feel
                secure rather than scared.
              </li>
              <li>
                <b>Learning by doing.</b> Science and computer labs, projects and practical work
                from the middle school years onward.
              </li>
              <li>
                <b>The whole child.</b> Sports, cultural events and competitions, because school is
                more than examinations.
              </li>
            </ul>
          </Reveal>
        </div>
      </section>

      <StatsCounter stats={data.stats} />

      <PrincipalMessage principal={data.principal} />

      <section className="section">
        <div className="container">
          <SectionIntro
            tag="Academic Structure"
            title="Every Stage, Under One Roof"
            description="A child can join at Nursery and finish Class 12 without ever changing schools."
          />
          <StageGrid stages={data.academicStages} />
        </div>
      </section>
    </>
  );
}
