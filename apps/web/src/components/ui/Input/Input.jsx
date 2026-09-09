import { cn } from '@/lib/cn';
import styles from './Input.module.css';

/**
 * Text/tel/email input matching the enquiry form styling.
 * Pass `error` to show a validation message below the field.
 */
export default function Input({ label, id, error, className, required, ...rest }) {
  return (
    <div className={cn(styles.field, className)}>
      {label ? (
        <label className={styles.label} htmlFor={id}>
          {label}
          {/* Screen readers get this from the input's own required attribute,
              so the star is decoration and is hidden from them. */}
          {required ? (
            <span className={styles.required} aria-hidden="true">
              {' '}
              *
            </span>
          ) : null}
        </label>
      ) : null}
      <input
        id={id}
        className={cn(styles.input, error && styles.invalid)}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        required={required}
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
