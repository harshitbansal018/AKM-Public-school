import { cn } from '@/lib/cn';
import LineIcon from '@/components/ui/LineIcon/LineIcon';
import styles from './StatCard.module.css';

/**
 * Dashboard KPI tile.
 * @param {string} props.icon  a LineIcon name, e.g. 'inbox'
 */
export default function StatCard({ icon, label, value, hint, tone = 'royal', className }) {
  return (
    <div className={cn(styles.card, styles[tone], className)}>
      <span className={styles.icon} aria-hidden="true">
        <LineIcon name={icon} size={22} />
      </span>
      <div>
        <b className={styles.value}>{value}</b>
        <span className={styles.label}>{label}</span>
        {hint ? <span className={styles.hint}>{hint}</span> : null}
      </div>
    </div>
  );
}
