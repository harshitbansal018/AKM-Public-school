'use client';

import { cn } from '@/lib/cn';
import { useReveal } from '@/hooks/useReveal';

/**
 * Wraps children in the site's reveal-on-scroll animation.
 *
 * @param {object}  props
 * @param {number}  [props.delay]     0–4, maps to the .d1–.d4 stagger classes
 * @param {string}  [props.as]        element to render, defaults to 'div'
 * @param {boolean} [props.disabled]  render visible immediately, no observer
 */
export default function Reveal({
  children,
  delay = 0,
  as: Tag = 'div',
  className,
  disabled = false,
  ...rest
}) {
  const [ref, isVisible] = useReveal();

  // Inside a horizontal slider the off-screen cards sit outside the viewport
  // to the right, so they never intersect and would stay at opacity 0 for
  // good. Callers in that position pass disabled and get them shown outright.
  const shown = disabled || isVisible;

  return (
    <Tag
      ref={disabled ? null : ref}
      className={cn('reveal', !disabled && delay > 0 && `d${delay}`, shown && 'visible', className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}
