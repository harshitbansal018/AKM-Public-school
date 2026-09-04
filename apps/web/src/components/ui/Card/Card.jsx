import { cn } from '@/lib/cn';
import styles from './Card.module.css';

/**
 * White rounded surface with the site shadow. `lift` adds the hover raise
 * used by the stage, stream, facility and achievement grids.
 */
export default function Card({ children, lift = false, radius = 'md', className, ...rest }) {
  return (
    <div
      className={cn(styles.card, styles[radius], lift && styles.lift, className)}
      {...rest}
    >
      {children}
    </div>
  );
}
