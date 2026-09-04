import { cn } from '@/lib/cn';
import styles from './StatCard.module.css';

/** Dashboard KPI tile. */
export default function StatCard({ icon, label, value, hint, tone = 'royal', className }) {
  return (
    <div className={cn(styles.card, styles[tone], className)}>
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
      <div>
        <b className={styles.value}>{value}</b>
        <span className={styles.label}>{label}</span>
        {hint ? <span className={styles.hint}>{hint}</span> : null}
      </div>
    </div>
  );
}
