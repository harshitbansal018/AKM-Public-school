import Reveal from '@/components/ui/Reveal/Reveal';
import styles from './StreamGrid.module.css';

/** Class 11–12 stream cards with their HPBOSE subject groups. */
export default function StreamGrid({ streams = [] }) {
  return (
    <div className={styles.grid}>
      {streams.map((stream, index) => (
        <Reveal key={stream.id} delay={Math.min(index, 4)} className={styles.stream}>
          <h3>
            <span aria-hidden="true">{stream.emoji}</span> {stream.title}
          </h3>
          <p>{stream.description}</p>
          <ul>
            {stream.subjects.map((subject) => (
              <li key={subject}>{subject}</li>
            ))}
          </ul>
        </Reveal>
      ))}
    </div>
  );
}
