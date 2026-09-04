import Deco from '@/components/layout/Deco/Deco';
import Button from '@/components/ui/Button/Button';
import styles from './Hero.module.css';

/** Opening banner: kicker, headline, intro copy, CTAs and the blob photo frame. */
export default function Hero({ hero }) {
  return (
    <section className={styles.hero}>
      <Deco shape="ring" motion="spin" size={180} style={{ top: '8%', right: '6%' }} />
      <Deco shape="dot-c" motion="slow" size={90} style={{ bottom: '12%', left: '4%' }} />
      <Deco shape="dot-t" motion="mid" size={56} style={{ top: '20%', left: '12%' }} />

      <div className={`container ${styles.inner}`}>
        <div>
          <span className={`${styles.kicker} ${styles.in} ${styles.d1}`}>{hero.kicker}</span>
          <h1 className={`${styles.title} ${styles.in} ${styles.d2}`}>
            {hero.titleLead} <em>{hero.titleAccent}</em>
          </h1>
          <p className={`${styles.lead} ${styles.in} ${styles.d3}`}>{hero.description}</p>
          <div className={`${styles.actions} ${styles.in} ${styles.d4}`}>
            <Button href="/admissions">Apply for Admission</Button>
            <Button href="/academics" variant="outline">
              Explore Academics
            </Button>
          </div>
        </div>

        <div className={`${styles.media} ${styles.mediaIn}`}>
          <div className={styles.photo}>{hero.imageCaption}</div>
          {hero.badges.map((badge, index) => (
            <div key={badge.id} className={`${styles.badge} ${index === 0 ? styles.b1 : styles.b2}`}>
              {badge.title}
              <small>{badge.subtitle}</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
