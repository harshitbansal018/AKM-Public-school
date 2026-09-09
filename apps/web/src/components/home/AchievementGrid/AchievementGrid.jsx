import Reveal from '@/components/ui/Reveal/Reveal';
import Carousel from '@/components/ui/Carousel/Carousel';
import styles from './AchievementGrid.module.css';

/** Cards in one desktop row. Past this, `slider` turns the section into one. */
const PER_VIEW = 3;

/**
 * Board toppers and competition wins.
 *
 * @param {object}  props
 * @param {boolean} [props.slider]  allow a slider once the cards outgrow a row
 */
export default function AchievementGrid({ achievements = [], slider = false }) {
  const asSlider = slider && achievements.length > PER_VIEW;

  const cards = achievements.map((item, index) => (
    <Reveal
      key={item.id}
      delay={Math.min(index, 4)}
      disabled={asSlider}
      className={styles.achievement}
    >
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
  ));

  if (asSlider) {
    return (
      <Carousel perView={PER_VIEW} label="achievements">
        {cards}
      </Carousel>
    );
  }

  return <div className={styles.grid}>{cards}</div>;
}
