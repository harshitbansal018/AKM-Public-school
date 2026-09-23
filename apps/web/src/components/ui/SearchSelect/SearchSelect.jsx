'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import LineIcon from '@/components/ui/LineIcon/LineIcon';
import styles from './SearchSelect.module.css';

/**
 * A dropdown you can type into — for lists too long to scroll, such as the
 * parent accounts on a student record or the students in a fee record.
 *
 * Behaves like Select (same value/onChange contract) so a form field can
 * switch between the two, but filters as you type and supports the keyboard:
 * ↑ ↓ to move, Enter to choose, Escape to close.
 *
 * @param {{value: string|number, label: string, hint?: string}[]} options
 * @param {(value: string) => void} onChange  called with the chosen value ('' when cleared)
 */
export default function SearchSelect({
  label,
  id,
  error,
  options = [],
  placeholder = 'Search…',
  emptyText = 'No matches',
  value,
  onChange,
  required,
  disabled,
  className,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const boxRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const selected = useMemo(
    () => options.find((option) => String(option.value) === String(value)) ?? null,
    [options, value]
  );

  // Typing filters on the label and the hint (a parent's email, a roll number).
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((option) =>
      `${option.label} ${option.hint ?? ''}`.toLowerCase().includes(q)
    );
  }, [options, query]);

  // Close when the click lands outside the whole control.
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (event) => {
      if (!boxRef.current?.contains(event.target)) close();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  // Keep the highlighted row in view while arrowing through a long list.
  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const openList = () => {
    if (disabled) return;
    setOpen(true);
    setQuery('');
    setActive(Math.max(0, matches.findIndex((option) => String(option.value) === String(value))));
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  const choose = (option) => {
    onChange(String(option.value));
    close();
  };

  const onKeyDown = (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) return openList();
      setActive((current) => {
        const next = event.key === 'ArrowDown' ? current + 1 : current - 1;
        return Math.max(0, Math.min(matches.length - 1, next));
      });
    } else if (event.key === 'Enter') {
      if (open && matches[active]) {
        event.preventDefault();
        choose(matches[active]);
      }
    } else if (event.key === 'Escape') {
      close();
    }
  };

  return (
    <div className={cn(styles.field, className)} ref={boxRef}>
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

      <div className={styles.control}>
        {/* The magnifier sits in its own gutter on the left, so it can never
            collide with the caret or the clear button on the right. */}
        <LineIcon name="search" size={16} className={styles.searchIcon} />

        {open ? (
          <input
            ref={inputRef}
            id={id}
            type="text"
            className={cn(styles.input, error && styles.invalid)}
            placeholder={placeholder}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            autoComplete="off"
            role="combobox"
            aria-expanded="true"
            aria-controls={`${id}-list`}
          />
        ) : (
          <button
            type="button"
            id={id}
            className={cn(styles.trigger, error && styles.invalid, !selected && styles.empty)}
            onClick={openList}
            onKeyDown={onKeyDown}
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded="false"
          >
            <span className={styles.triggerText}>
              {selected ? (
                <>
                  {selected.label}
                  {selected.hint ? <small>{selected.hint}</small> : null}
                </>
              ) : (
                placeholder
              )}
            </span>
          </button>
        )}

        {/* One control on the right at a time: clear a chosen value, or the
            caret that says "this opens a list". */}
        {selected && !open && !disabled ? (
          <button
            type="button"
            className={styles.clear}
            onClick={() => onChange('')}
            aria-label={`Clear ${label ?? 'selection'}`}
          >
            ×
          </button>
        ) : !open ? (
          <LineIcon name="chevronDown" size={16} className={styles.caret} />
        ) : null}

        {open ? (
          <ul className={styles.list} id={`${id}-list`} role="listbox" ref={listRef}>
            {matches.length === 0 ? (
              <li className={styles.none}>{emptyText}</li>
            ) : (
              matches.slice(0, 200).map((option, index) => (
                <li key={option.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={String(option.value) === String(value)}
                    data-active={index === active}
                    className={cn(
                      styles.option,
                      index === active && styles.active,
                      String(option.value) === String(value) && styles.chosen
                    )}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => choose(option)}
                  >
                    <span>{option.label}</span>
                    {option.hint ? <small>{option.hint}</small> : null}
                  </button>
                </li>
              ))
            )}
            {matches.length > 200 ? (
              <li className={styles.none}>Showing the first 200 — keep typing to narrow it down.</li>
            ) : null}
          </ul>
        ) : null}
      </div>

      {error ? (
        <span className={styles.error} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
