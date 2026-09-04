'use client';

import { useEffect, useState } from 'react';

/**
 * True once the page has scrolled past `offset` pixels.
 * Drives the header shadow (offset 40) and the back-to-top button (offset 500).
 */
export function useScrolled(offset = 40) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > offset);
    onScroll(); // account for a restored scroll position on mount
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [offset]);

  return scrolled;
}

export default useScrolled;
