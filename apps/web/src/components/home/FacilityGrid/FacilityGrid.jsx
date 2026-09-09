import Reveal from '@/components/ui/Reveal/Reveal';
import Carousel from '@/components/ui/Carousel/Carousel';
import styles from './FacilityGrid.module.css';

/** Cards in one desktop row. Past this, `slider` turns the section into one. */
const PER_VIEW = 4;

/**
 * Campus facility cards — lab, playground, classrooms and so on.
 *
 * @param {object}  props
 * @param {boolean} [props.slider]  allow a slider once the cards outgrow a row
 */
export default function FacilityGrid({ facilities = [], slider = false }) {
  const asSlider = slider && facilities.length > PER_VIEW;

  const cards = facilities.map((facility, index) => (
    <Reveal
      key={facility.id}
      delay={Math.min(index, 4)}
      disabled={asSlider}
      className={styles.facility}
    >
      <div className={styles.icon} aria-hidden="true">
        {facility.icon}
      </div>
      <h3>{facility.title}</h3>
      <p>{facility.description}</p>
    </Reveal>
  ));

  if (asSlider) {
    return (
      <Carousel perView={PER_VIEW} label="facilities">
        {cards}
      </Carousel>
    );
  }

  return <div className={styles.grid}>{cards}</div>;
}
