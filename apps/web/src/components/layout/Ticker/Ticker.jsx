import styles from './Ticker.module.css';

/**
 * Scrolling announcement strip.
 *
 * The list is rendered twice so the -50% keyframe loops seamlessly — the old
 * page did this by duplicating innerHTML at runtime; here it is just markup,
 * which means it also works before hydration.
 */
export default function Ticker({ announcements = [] }) {
  if (announcements.length === 0) return null;

  const doubled = [...announcements, ...announcements];

  return (
    <div className={styles.ticker} aria-label="Latest announcements">
      <div className={styles.track}>
        {doubled.map((item, index) => (
          <span key={`${item.id}-${index}`} aria-hidden={index >= announcements.length}>
            {item.text}
          </span>
        ))}
      </div>
    </div>
  );
}
