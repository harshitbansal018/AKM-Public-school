import Reveal from '@/components/ui/Reveal/Reveal';
import Carousel from '@/components/ui/Carousel/Carousel';
import styles from './StreamGrid.module.css';

/** Cards in one desktop row. Past this, `slider` turns the section into one. */
const PER_VIEW = 3;

/**
 * Class 11–12 stream cards with their HPBOSE subject groups.
 *
 * @param {object}  props
 * @param {boolean} [props.slider]  allow a slider once the cards outgrow a row
 */
export default function StreamGrid({ streams = [], slider = false }) {
  const asSlider = slider && streams.length > PER_VIEW;

  const cards = streams.map((stream, index) => (
    <Reveal key={stream.id} delay={Math.min(index, 4)} disabled={asSlider} className={styles.stream}>
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
  ));

  if (asSlider) {
    return (
      <Carousel perView={PER_VIEW} label="streams">
        {cards}
      </Carousel>
    );
  }

  return <div className={styles.grid}>{cards}</div>;
}
