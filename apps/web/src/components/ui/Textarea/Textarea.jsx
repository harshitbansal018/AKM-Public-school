import { cn } from '@/lib/cn';
import styles from './Textarea.module.css';

export default function Textarea({ label, id, error, className, required, ...rest }) {
  return (
    <div className={cn(styles.field, className)}>
      {label ? (
        <label className={styles.label} htmlFor={id}>
          {label}
          {required ? (
            <span className={styles.required} aria-hidden="true">
              {' '}
              *
            </span>
          ) : null}
        </label>
      ) : null}
      <textarea
        id={id}
        className={cn(styles.textarea, error && styles.invalid)}
        aria-invalid={error ? 'true' : undefined}
        required={required}
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
