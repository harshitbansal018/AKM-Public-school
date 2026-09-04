/** "Annual Exam Date Sheet!" -> "annual-exam-date-sheet" */
export function slugify(text = '') {
  return String(text)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 180) || 'item';
}

/**
 * Builds a slug that is not already taken, appending -2, -3, … as needed.
 *
 * @param {string} text
 * @param {(slug: string) => Promise<boolean>} exists  returns true if taken
 * @param {string|null} [currentSlug]  the record's own slug, which may be kept
 */
export async function uniqueSlug(text, exists, currentSlug = null) {
  const base = slugify(text);
  if (currentSlug && base === currentSlug) return base;

  let candidate = base;
  let suffix = 2;
  // Bounded so a pathological case can never loop forever.
  while (await exists(candidate)) {
    if (suffix > 500) return `${base}-${Date.now()}`;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

export default slugify;
