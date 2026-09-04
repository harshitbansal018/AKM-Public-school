import Reveal from '@/components/ui/Reveal/Reveal';
import styles from './FacilityGrid.module.css';

/** Campus facility cards — lab, playground, classrooms and so on. */
export default function FacilityGrid({ facilities = [] }) {
  return (
    <div className={styles.grid}>
      {facilities.map((facility, index) => (
        <Reveal key={facility.id} delay={Math.min(index, 4)} className={styles.facility}>
          <div className={styles.icon} aria-hidden="true">
            {facility.icon}
          </div>
          <h3>{facility.title}</h3>
          <p>{facility.description}</p>
        </Reveal>
      ))}
    </div>
  );
}
