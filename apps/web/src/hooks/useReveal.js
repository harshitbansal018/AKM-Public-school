'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Reveal-on-scroll, replacing the IntersectionObserver block from the old
 * static page. Unobserves after the first intersection so each element
 * animates exactly once.
 *
 * @param {{ threshold?: number, rootMargin?: string }} options
 * @returns {[React.RefObject, boolean]} ref to attach, and whether it is visible
 */
export function useReveal({ threshold = 0.15, rootMargin = '0px' } = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    // Users who prefer reduced motion see content immediately.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return [ref, isVisible];
}

export default useReveal;
