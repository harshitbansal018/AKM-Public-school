'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import styles from './Carousel.module.css';

/**
 * Horizontal card slider, used by a section only once it holds more cards than
 * fit in one row. Below that the section stays a plain grid, so nothing about
 * the current pages changes.
 *
 * The scrolling itself is CSS scroll-snap on the track, not JavaScript: touch
 * dragging, the trackpad and the arrow keys all work on their own. The arrows
 * and dots below are an extra for mouse users.
 *
 * @param {object} props
 * @param {number} [props.perView]  cards visible at once on a wide screen
 * @param {string} [props.label]    plural noun for screen readers, e.g. "achievements"
 */
export default function Carousel({ children, perView = 3, label = 'cards' }) {
  const trackRef = useRef(null);
  const [view, setView] = useState({ atStart: true, atEnd: false, page: 0, pages: 1 });

  const readPosition = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const { scrollLeft, clientWidth, scrollWidth } = track;
    const pages = Math.max(1, Math.round(scrollWidth / clientWidth));

    setView({
      // A few pixels of slack: browsers round sub-pixel scroll offsets, so an
      // exact comparison would leave an arrow enabled at the very end.
      atStart: scrollLeft <= 4,
      atEnd: scrollLeft + clientWidth >= scrollWidth - 4,
      page: Math.min(pages - 1, Math.round(scrollLeft / clientWidth)),
      pages,
    });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    readPosition();
    track.addEventListener('scroll', readPosition, { passive: true });

    // Cards per view changes at the breakpoints, which changes the page count.
    const observer = new ResizeObserver(readPosition);
    observer.observe(track);

    return () => {
      track.removeEventListener('scroll', readPosition);
      observer.disconnect();
    };
  }, [readPosition]);

  const scrollToPage = (index) => {
    const track = trackRef.current;
    if (track) track.scrollTo({ left: index * track.clientWidth, behavior: 'smooth' });
  };

  const step = (direction) => {
    const track = trackRef.current;
    if (track) track.scrollBy({ left: direction * track.clientWidth, behavior: 'smooth' });
  };

  return (
    <div className={styles.carousel} style={{ '--per-view-wide': perView }}>
      <div className={styles.viewport}>
        {/* A plain div, so the cards keep exactly the markup the grid gives
            them. tabIndex makes the track focusable, so arrow keys scroll it. */}
        <div
          className={styles.track}
          ref={trackRef}
          tabIndex={0}
          role="group"
          aria-label={label}
        >
          {children}
        </div>

        <button
          type="button"
          className={cn(styles.arrow, styles.prev)}
          onClick={() => step(-1)}
          disabled={view.atStart}
          aria-label={`Previous ${label}`}
        >
          <span aria-hidden="true">‹</span>
        </button>

        <button
          type="button"
          className={cn(styles.arrow, styles.next)}
          onClick={() => step(1)}
          disabled={view.atEnd}
          aria-label={`Next ${label}`}
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>

      {view.pages > 1 ? (
        <div className={styles.dots}>
          {Array.from({ length: view.pages }, (_, index) => (
            <button
              key={index}
              type="button"
              className={cn(styles.dot, index === view.page && styles.dotActive)}
              onClick={() => scrollToPage(index)}
              aria-label={`Show ${label} page ${index + 1} of ${view.pages}`}
              aria-current={index === view.page ? 'true' : undefined}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
