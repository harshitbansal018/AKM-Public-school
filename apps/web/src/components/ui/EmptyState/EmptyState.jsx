import { cn } from '@/lib/cn';
import styles from './EmptyState.module.css';

/** Friendly placeholder for lists with nothing in them yet — text only, no icon. */
export default function EmptyState({ title, description, action, className }) {
  return (
    <div className={cn(styles.empty, className)}>
      <h3 className={styles.title}>{title}</h3>
      {description ? <p className={styles.description}>{description}</p> : null}
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
