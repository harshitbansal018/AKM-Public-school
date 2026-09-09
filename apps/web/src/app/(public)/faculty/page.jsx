import Image from 'next/image';
import { getFaculty, getSettings } from '@/lib/serverApi';
import { buildMetadata } from '@/lib/seo';
import { text } from '@/lib/content';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
import SectionIntro from '@/components/ui/SectionIntro/SectionIntro';
import Reveal from '@/components/ui/Reveal/Reveal';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import Button from '@/components/ui/Button/Button';
import styles from './faculty.module.css';

export async function generateMetadata() {
  const settings = await getSettings();
  return buildMetadata({
    title: text(settings, 'page_faculty_title', 'Faculty & Staff'),
    description: text(settings, 'page_faculty_subtitle'),
    path: '/faculty',
  });
}

/**
 * Groups staff by their subject.
 *
 * The Faculty table has no separate "department" column, and a subject is what
 * the school actually records — so subject is the grouping. Anyone without one
 * is administrative or support staff and goes in their own group at the end.
 */
function groupBySubject(staff, adminLabel) {
  const groups = new Map();

  for (const person of staff) {
    const key = person.subject?.trim() || adminLabel;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(person);
  }

  // Administrative staff always last, subjects alphabetical before it.
  const named = [...groups.keys()].filter((k) => k !== adminLabel).sort((a, b) => a.localeCompare(b));
  const ordered = groups.has(adminLabel) ? [...named, adminLabel] : named;

  return ordered.map((label) => ({ label, people: groups.get(label) }));
}

function StaffCard({ person }) {
  return (
    <div className={styles.card}>
      <div className={styles.photoWrap}>
        {person.photo ? (
          <Image
            src={person.photo}
            alt={person.name}
            width={200}
            height={200}
            className={styles.photo}
          />
        ) : (
          <span className={styles.initials} aria-hidden="true">
            {person.name
              .split(/\s+/)
              .filter((w) => !/^(mr|mrs|ms|dr|shri|smt)\.?$/i.test(w))
              .slice(0, 2)
              .map((w) => w[0])
              .join('')
              .toUpperCase()}
          </span>
        )}
      </div>

      <h3 className={styles.name}>{person.name}</h3>
      <p className={styles.designation}>{person.designation}</p>
      {person.qualification ? <p className={styles.qualification}>{person.qualification}</p> : null}
      {person.subject ? <span className={styles.subjectTag}>{person.subject}</span> : null}
    </div>
  );
}

export default async function FacultyPage() {
  const [staff, settings] = await Promise.all([getFaculty(), getSettings()]);

  const adminLabel = text(settings, 'faculty_admin_group_label', 'Administration & Support');
  const principal = staff.find((person) => person.isPrincipal) ?? null;
  const others = staff.filter((person) => !person.isPrincipal);
  const groups = groupBySubject(others, adminLabel);

  return (
    <>
      <PageHeader
        title={text(settings, 'page_faculty_title', 'Faculty & Staff')}
        subtitle={text(settings, 'page_faculty_subtitle')}
        breadcrumbs={[{ label: 'Faculty & Staff' }]}
      />

      {principal ? (
        <section className="section bg-white">
          <div className={`container ${styles.principal}`}>
            <Reveal className={styles.principalPhoto}>
              {principal.photo ? (
                <Image
                  src={principal.photo}
                  alt={principal.name}
                  width={320}
                  height={352}
                  className={styles.principalImg}
                />
              ) : (
                <div className={styles.principalPlaceholder}>Photo</div>
              )}
            </Reveal>

            <Reveal delay={1}>
              <span className={styles.tag}>
                {text(settings, 'faculty_principal_tag', 'Head of the School')}
              </span>
              <h2 className={styles.principalName}>{principal.name}</h2>
              <p className={styles.principalRole}>{principal.designation}</p>
              {principal.qualification ? (
                <p className={styles.principalQual}>{principal.qualification}</p>
              ) : null}
              {principal.message ? (
                <blockquote className={styles.quote}>&ldquo;{principal.message}&rdquo;</blockquote>
              ) : null}
            </Reveal>
          </div>
        </section>
      ) : null}

      <section className="section">
        <div className="container">
          <SectionIntro
            tag={text(settings, 'faculty_team_tag', 'Our Team')}
            title={text(settings, 'faculty_team_title', 'Teaching & Support Staff')}
            description={text(settings, 'faculty_team_description')}
          />

          {others.length === 0 ? (
            <EmptyState
              icon="👩‍🏫"
              title={text(settings, 'faculty_empty_title', 'Staff details coming soon')}
              description={text(settings, 'faculty_empty_description')}
              action={<Button href="/contact">Contact the school</Button>}
            />
          ) : (
            groups.map((group) => (
              <div key={group.label} className={styles.group}>
                <h3 className={styles.groupTitle}>
                  {group.label}
                  <span className={styles.count}>
                    {group.people.length} {group.people.length === 1 ? 'member' : 'members'}
                  </span>
                </h3>

                <div className={styles.grid}>
                  {group.people.map((person, index) => (
                    <Reveal key={person.id} delay={Math.min(index, 4)}>
                      <StaffCard person={person} />
                    </Reveal>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="section bg-sky">
        <div className="container">
          <SectionIntro
            tag={text(settings, 'faculty_join_tag', 'Work With Us')}
            title={text(settings, 'faculty_join_title', 'Interested in Teaching Here?')}
            description={text(settings, 'faculty_join_description')}
          />
          <div style={{ textAlign: 'center' }}>
            <Button href="/contact">Get in Touch</Button>
          </div>
        </div>
      </section>
    </>
  );
}
