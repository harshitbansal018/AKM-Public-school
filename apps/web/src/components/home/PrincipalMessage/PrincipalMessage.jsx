import Image from 'next/image';
import Reveal from '@/components/ui/Reveal/Reveal';
import styles from './PrincipalMessage.module.css';

/** Principal's photo alongside the welcome message and signature block. */
export default function PrincipalMessage({ principal }) {
  return (
    <section className={`section ${styles.section}`}>
      <div className={`container ${styles.grid}`}>
        <Reveal className={styles.photoWrap}>
          {principal.photo ? (
            <Image
              src={principal.photo}
              alt={principal.name}
              width={340}
              height={374}
              className={styles.photo}
            />
          ) : (
            <div className={styles.photoPlaceholder}>{principal.photoCaption}</div>
          )}
        </Reveal>

        <Reveal delay={1}>
          <span className={styles.tag}>Principal&apos;s Message</span>
          <h2 className={styles.heading}>{principal.heading}</h2>
          <blockquote className={styles.quote}>&ldquo;{principal.message}&rdquo;</blockquote>
          <div className={styles.name}>
            <b>{principal.name}</b>
            <span>{principal.designation}</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
