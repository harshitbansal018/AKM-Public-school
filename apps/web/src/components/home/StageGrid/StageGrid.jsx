import Reveal from '@/components/ui/Reveal/Reveal';
import Carousel from '@/components/ui/Carousel/Carousel';
import styles from './StageGrid.module.css';

/** Cards in one desktop row. Past this, `slider` turns the section into one. */
const PER_VIEW = 5;

/**
 * The academic stage cards, Pre-Primary through Senior Secondary.
 * The coloured top border comes from each stage's accentColor.
 *
 * @param {object}  props
 * @param {boolean} [props.slider]  allow a slider once the cards outgrow a row
 */
export default function StageGrid({ stages = [], slider = false }) {
  const asSlider = slider && stages.length > PER_VIEW;

  const cards = stages.map((stage, index) => (
    <Reveal
      key={stage.id}
      delay={Math.min(index, 4)}
      disabled={asSlider}
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
  ));

  if (asSlider) {
    return (
      <Carousel perView={PER_VIEW} label="stages">
        {cards}
      </Carousel>
    );
  }

  return <div className={styles.grid}>{cards}</div>;
}
