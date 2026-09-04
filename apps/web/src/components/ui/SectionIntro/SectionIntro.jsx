import { cn } from '@/lib/cn';
import Reveal from '@/components/ui/Reveal/Reveal';
import styles from './SectionIntro.module.css';

/**
 * The centred tag + heading + subtext block that opens most sections.
 */
export default function SectionIntro({ tag, title, description, className }) {
  return (
    <Reveal className={cn(styles.intro, className)}>
      {tag ? <span className={styles.tag}>{tag}</span> : null}
      <h2 className={styles.title}>{title}</h2>
      {description ? <p className={styles.description}>{description}</p> : null}
    </Reveal>
  );
}
