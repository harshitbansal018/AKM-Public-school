/**
 * Decoders for the list-shaped settings.
 *
 * A setting row holds one string, but some page content is naturally a list.
 * Rather than adding tables for each, two compact encodings are used — and
 * decoded here so no page has to know about the separators:
 *
 *   lines  "one|two|three"
 *   pairs  "Heading::Body|Heading::Body"
 *   text   paragraphs separated by a blank line
 */

/** "one|two|three" -> ['one', 'two', 'three'] */
export function toList(value) {
  if (!value) return [];
  return String(value)
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * "Heading::Body|Heading::Body" -> [{ id, title, description }]
 * An entry with no "::" becomes a title with no description.
 */
export function toPairs(value) {
  return toList(value).map((entry, index) => {
    const separator = entry.indexOf('::');
    if (separator === -1) return { id: index + 1, title: entry.trim(), description: '' };
    return {
      id: index + 1,
      title: entry.slice(0, separator).trim(),
      description: entry.slice(separator + 2).trim(),
    };
  });
}

/** Splits a textarea value into paragraphs on blank lines. */
export function toParagraphs(value) {
  if (!value) return [];
  return String(value)
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

/**
 * Reads a setting, falling back when the key is missing or blank — so a page
 * never renders an empty heading just because a row was cleared.
 */
export function text(settings, key, fallback = '') {
  const value = settings?.[key];
  return value === undefined || value === null || value === '' ? fallback : value;
}
