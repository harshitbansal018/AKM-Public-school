const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

/**
 * Split a date into the two-part badge used on notice cards.
 * @returns {{ day: string, month: string, year: string }}
 */
export function toDateBadge(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return { day: '--', month: '---', year: '----' };
  return {
    day: String(d.getDate()).padStart(2, '0'),
    month: MONTHS[d.getMonth()],
    year: String(d.getFullYear()),
  };
}

/** "15 March 2026" */
export function formatLongDate(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** "15 Mar 2026, 10:14" — for logs and timestamps */
export function formatDateTime(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
}

/** 12500 → "₹12,500" (fees and salaries) */
export function formatMoney(value) {
  const amount = Number(value ?? 0);
  return `₹${(Number.isNaN(amount) ? 0 : amount).toLocaleString('en-IN')}`;
}

/** Machine-readable date for <time datetime="..."> */
export function toISODate(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}

/** "+91 98765 43210" → "+919876543210" for tel: links */
export function toTelHref(phone = '') {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

/** Bytes → "1.4 MB" */
export function formatFileSize(bytes) {
  if (!bytes) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let i = 0;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i += 1;
  }
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
