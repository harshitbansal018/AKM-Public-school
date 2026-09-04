import { cn } from '@/lib/cn';
import styles from './Textarea.module.css';

export default function Textarea({ label, id, error, className, ...rest }) {
  return (
    <div className={cn(styles.field, className)}>
      {label ? (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      ) : null}
      <textarea
        id={id}
        className={cn(styles.textarea, error && styles.invalid)}
        aria-invalid={error ? 'true' : undefined}
        {...rest}
      />
      {error ? (
        <span className={styles.error} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
