'use client';

import { useCountUp } from '@/hooks/useCountUp';
import styles from './StatsCounter.module.css';

function Stat({ value, suffix, label }) {
  const [ref, current] = useCountUp(value);

  return (
    <div className={styles.stat} ref={ref}>
      <b>
        {current}
        {suffix}
      </b>
      <span>{label}</span>
    </div>
  );
}

/**
 * The navy stat bar that overlaps the hero.
 * Each number counts up once, the first time it scrolls into view.
 */
export default function StatsCounter({ stats = [] }) {
  return (
    <div className="container">
      <div className={styles.stats}>
        {stats.map((stat) => (
          <Stat key={stat.id} value={stat.value} suffix={stat.suffix} label={stat.label} />
        ))}
      </div>
    </div>
  );
}
