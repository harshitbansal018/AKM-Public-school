import Link from 'next/link';
import { cn } from '@/lib/cn';
import styles from './PageHeader.module.css';

/**
 * Banner at the top of every inner page: title, optional subtitle and a
 * breadcrumb trail back to the homepage.
 *
 * @param {{label: string, href?: string}[]} [props.breadcrumbs]
 */
export default function PageHeader({ title, subtitle, breadcrumbs = [], className }) {
  return (
    <header className={cn(styles.header, className)}>
      <div className="container">
        <nav className={styles.crumbs} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          {breadcrumbs.map((crumb) => (
            <span key={crumb.label} className={styles.crumb}>
              <span className={styles.sep} aria-hidden="true">
                /
              </span>
              {crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : <span>{crumb.label}</span>}
            </span>
          ))}
        </nav>
        <h1 className={styles.title}>{title}</h1>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      </div>
    </header>
  );
}
