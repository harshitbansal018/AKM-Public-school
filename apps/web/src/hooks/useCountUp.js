'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Animated stat counter — the easeOutCubic tween from the old page, driven by
 * requestAnimationFrame and started only when the element scrolls into view.
 *
 * @param {number} target   final value
 * @param {{ duration?: number, threshold?: number }} options
 * @returns {[React.RefObject, number]} ref to attach, and the current value
 */
export function useCountUp(target, { duration = 1600, threshold = 0.4 } = {}) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return undefined;
    }

    let frameId;

    const run = () => {
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        setValue(Math.round(target * eased));
        if (progress < 1) frameId = requestAnimationFrame(tick);
      };
      frameId = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            run();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [target, duration, threshold]);

  return [ref, value];
}

export default useCountUp;
