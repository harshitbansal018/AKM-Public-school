import { cn } from '@/lib/cn';
import styles from './Select.module.css';

/**
 * @param {object}   props
 * @param {{value: string, label: string}[]} props.options
 * @param {string}   [props.placeholder] shown as a disabled first option
 */
export default function Select({ label, id, error, options = [], placeholder, className, ...rest }) {
  return (
    <div className={cn(styles.field, className)}>
      {label ? (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      ) : null}
      <select
        id={id}
        className={cn(styles.select, error && styles.invalid)}
        aria-invalid={error ? 'true' : undefined}
        {...rest}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <span className={styles.error} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
