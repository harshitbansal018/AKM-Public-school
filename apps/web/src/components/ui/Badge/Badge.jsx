import { cn } from '@/lib/cn';
import styles from './Badge.module.css';

/** Small rounded pill — notice categories, download types, status labels. */
export default function Badge({ children, tone = 'sky', className }) {
  return <span className={cn(styles.badge, styles[tone], className)}>{children}</span>;
}
