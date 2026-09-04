'use client';

import { cn } from '@/lib/cn';
import { useReveal } from '@/hooks/useReveal';

/**
 * Wraps children in the site's reveal-on-scroll animation.
 *
 * @param {object}  props
 * @param {number}  [props.delay]  0–4, maps to the .d1–.d4 stagger classes
 * @param {string}  [props.as]     element to render, defaults to 'div'
 */
export default function Reveal({ children, delay = 0, as: Tag = 'div', className, ...rest }) {
  const [ref, isVisible] = useReveal();

  return (
    <Tag
      ref={ref}
      className={cn('reveal', delay > 0 && `d${delay}`, isVisible && 'visible', className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}
