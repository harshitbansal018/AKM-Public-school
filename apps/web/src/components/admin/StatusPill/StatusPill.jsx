import { cn } from '@/lib/cn';
import styles from './StatusPill.module.css';

const TONES = {
  NEW: 'red',
  CONTACTED: 'gold',
  ADMITTED: 'green',
  CLOSED: 'muted',
  published: 'green',
  draft: 'muted',
  active: 'green',
  inactive: 'muted',
};

/** Coloured status label used in list tables. */
export default function StatusPill({ value, label }) {
  const tone = TONES[value] ?? 'sky';
  return <span className={cn(styles.pill, styles[tone])}>{label ?? value}</span>;
}
