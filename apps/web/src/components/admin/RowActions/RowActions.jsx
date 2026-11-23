'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';
import styles from './RowActions.module.css';

const ActionsContext = createContext(null);

/** One command inside the row's compact Actions menu. */
export function RowButton({ children, tone = 'default', onClick, disabled, title }) {
  const actions = useContext(ActionsContext);
  const handleClick = (event) => {
    onClick?.(event);
    actions?.close();
  };

  return (
    <button
      type="button"
      role="menuitem"
      className={cn(styles.button, styles[tone])}
      onClick={handleClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  );
}

/**
 * A portal-backed menu avoids making every table's Actions column wide, and
 * cannot be clipped by the table's horizontal scroll container.
 */
export function RowActions({ children }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, visible: false });
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const menuId = useId();

  const close = useCallback(() => setOpen(false), []);

  const placeMenu = useCallback(() => {
    if (!triggerRef.current || !menuRef.current) return;
    const trigger = triggerRef.current.getBoundingClientRect();
    const menu = menuRef.current;
    const gap = 6;
    const edge = 8;
    const left = Math.min(
      Math.max(edge, trigger.right - menu.offsetWidth),
      window.innerWidth - menu.offsetWidth - edge
    );
    const below = trigger.bottom + gap;
    const top = below + menu.offsetHeight <= window.innerHeight - edge
      ? below
      : Math.max(edge, trigger.top - menu.offsetHeight - gap);
    setPosition({ top, left, visible: true });
  }, []);

  useEffect(() => setMounted(true), []);
  useLayoutEffect(() => {
    if (open) {
      placeMenu();
      menuRef.current?.querySelector('button:not(:disabled)')?.focus();
    }
    else setPosition((current) => ({ ...current, visible: false }));
  }, [open, placeMenu]);

  const onMenuKeyDown = (event) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    const items = [...menuRef.current.querySelectorAll('button:not(:disabled)')];
    if (items.length === 0) return;
    event.preventDefault();
    const current = items.indexOf(document.activeElement);
    const next = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? items.length - 1
        : event.key === 'ArrowDown'
          ? (current + 1) % items.length
          : (current - 1 + items.length) % items.length;
    items[next].focus();
  };

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (triggerRef.current?.contains(event.target) || menuRef.current?.contains(event.target)) return;
      close();
    };
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      close();
      triggerRef.current?.focus();
    };
    const onViewportChange = () => close();
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onViewportChange);
    window.addEventListener('scroll', onViewportChange, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onViewportChange);
      window.removeEventListener('scroll', onViewportChange, true);
    };
  }, [close, open]);

  return (
    <ActionsContext.Provider value={{ close }}>
      <div className={styles.group}>
        <button
          ref={triggerRef}
          type="button"
          className={styles.trigger}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((current) => !current)}
        >
          Actions <span aria-hidden="true">⋮</span>
        </button>
      </div>

      {mounted
        ? createPortal(
            <div
              ref={menuRef}
              id={menuId}
              role="menu"
              className={styles.menu}
              hidden={!open}
              onKeyDown={onMenuKeyDown}
              style={{
                top: position.top,
                left: position.left,
                visibility: position.visible ? 'visible' : 'hidden',
              }}
            >
              {children}
            </div>,
            document.body
          )
        : null}
    </ActionsContext.Provider>
  );
}

export default RowActions;
