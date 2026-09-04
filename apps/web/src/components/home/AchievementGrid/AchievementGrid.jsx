import Reveal from '@/components/ui/Reveal/Reveal';
import styles from './AchievementGrid.module.css';

/** Board toppers and competition wins. */
export default function AchievementGrid({ achievements = [] }) {
  return (
    <div className={styles.grid}>
      {achievements.map((item, index) => (
        <Reveal key={item.id} delay={Math.min(index, 4)} className={styles.achievement}>
          <div className={styles.medal} aria-hidden="true">
            {item.medal}
          </div>
          <h3>
            {item.studentName}
            {item.classLabel ? ` — ${item.classLabel}` : ''}
          </h3>
          {item.score ? <div className={styles.score}>{item.score}</div> : null}
          <p>{item.description}</p>
        </Reveal>
      ))}
    </div>
  );
}
