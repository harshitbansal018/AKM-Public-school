import { cn } from '@/lib/cn';
import styles from './Skeleton.module.css';

/** Shimmer placeholder used by loading.jsx files. */
export default function Skeleton({ width = '100%', height = 16, radius = 'var(--radius-sm)', className }) {
  return (
    <span
      className={cn(styles.skeleton, className)}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}
