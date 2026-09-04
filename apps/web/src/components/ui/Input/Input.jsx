import { cn } from '@/lib/cn';
import styles from './Input.module.css';

/**
 * Text/tel/email input matching the enquiry form styling.
 * Pass `error` to show a validation message below the field.
 */
export default function Input({ label, id, error, className, ...rest }) {
  return (
    <div className={cn(styles.field, className)}>
      {label ? (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      ) : null}
      <input
        id={id}
        className={cn(styles.input, error && styles.invalid)}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
      />
      {error ? (
        <span id={`${id}-error`} className={styles.error} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
