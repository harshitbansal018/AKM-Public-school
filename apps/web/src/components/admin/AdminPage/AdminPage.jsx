import { cn } from '@/lib/cn';
import styles from './AdminPage.module.css';

/** Title, optional description, and a slot for the primary action button. */
export default function AdminPage({ title, description, action, children, className }) {
  return (
    <div className={cn(styles.page, className)}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{title}</h1>
          {description ? <p className={styles.description}>{description}</p> : null}
        </div>
        {action ? <div className={styles.action}>{action}</div> : null}
      </header>
      {children}
    </div>
  );
}
