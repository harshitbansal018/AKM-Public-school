import Image from 'next/image';
import Reveal from '@/components/ui/Reveal/Reveal';
import styles from './PrincipalMessage.module.css';

/** The Principal's and Managing Director's messages shown on public pages. */
export default function PrincipalMessage({ principal, director = null }) {
  const leaders = [
    principal && { ...principal, label: "Principal's Message" },
    director && { ...director, label: "Managing Director's Message" },
  ].filter(Boolean);

  if (!leaders.length) return null;

  return leaders.map((leader) => (
    <section className={`section ${styles.section}`} key={leader.id}>
      <div className={`container ${styles.grid}`}>
        <Reveal className={styles.photoWrap}>
          {leader.photo ? (
            <Image
              src={leader.photo}
              alt={leader.name}
              width={340}
              height={374}
              className={styles.photo}
            />
          ) : (
            <div className={styles.photoPlaceholder}>{leader.photoCaption}</div>
          )}
        </Reveal>

        <Reveal delay={1}>
          <span className={styles.tag}>{leader.label}</span>
          <h2 className={styles.heading}>{leader.heading}</h2>
          <blockquote className={styles.quote}>&ldquo;{leader.message}&rdquo;</blockquote>
          <div className={styles.name}>
            <b>{leader.name}</b>
            <span>{leader.designation}</span>
          </div>
        </Reveal>
      </div>
    </section>
  ));
}
