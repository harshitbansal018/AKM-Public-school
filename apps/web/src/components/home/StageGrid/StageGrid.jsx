import Reveal from '@/components/ui/Reveal/Reveal';
import styles from './StageGrid.module.css';

/**
 * The five academic stage cards, Pre-Primary through Senior Secondary.
 * The coloured top border comes from each stage's accentColor.
 */
export default function StageGrid({ stages = [] }) {
  return (
    <div className={styles.grid}>
      {stages.map((stage, index) => (
        <Reveal
          key={stage.id}
          delay={Math.min(index, 4)}
          className={styles.stage}
          style={{ borderTopColor: stage.accentColor }}
        >
          <div className={styles.emoji} aria-hidden="true">
            {stage.emoji}
          </div>
          <h3>{stage.title}</h3>
          <span className={styles.range}>{stage.classRange}</span>
          <p>{stage.description}</p>
        </Reveal>
      ))}
    </div>
  );
}
