import Link from 'next/link';
import { cn } from '@/lib/cn';

const VARIANTS = {
  primary: 'btn-primary',
  outline: 'btn-outline',
  whatsapp: 'btn-wa',
};

/**
 * Renders the site's button styling as a <button>, a next/link, or an <a>.
 * Styling lives in globals.css so the classes stay reusable everywhere.
 *
 * @param {object} props
 * @param {'primary'|'outline'|'whatsapp'} [props.variant]
 * @param {string} [props.href]      internal path → next/link, external → <a>
 * @param {boolean} [props.small]
 */
export default function Button({
  children,
  variant = 'primary',
  href,
  small = false,
  className,
  ...rest
}) {
  const classes = cn('btn', VARIANTS[variant] ?? VARIANTS.primary, small && 'btn-sm', className);

  if (href) {
    const isExternal = /^(https?:|mailto:|tel:)/.test(href);
    if (isExternal) {
      return (
        <a
          href={href}
          className={classes}
          target={href.startsWith('http') ? '_blank' : undefined}
          rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
          {...rest}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  );
}
