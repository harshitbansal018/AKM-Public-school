import sanitizeHtml from 'sanitize-html';

/**
 * Cleans HTML from the admin panel's rich-text editor before it is stored.
 *
 * Only the elements the editor produces and the public pages can style are
 * kept; scripts, event handlers, styles and unknown tags are stripped. The
 * editor is trusted for convenience, never for safety — the API is the gate.
 */
const OPTIONS = {
  allowedTags: [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's',
    'h2', 'h3', 'h4',
    'ul', 'ol', 'li',
    'a', 'blockquote', 'hr',
    'table', 'thead', 'tbody', 'tr', 'th', 'td', 'figure',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    figure: ['class'],
    table: ['class'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  // Links the editor marks as external open in a new tab, safely.
  transformTags: {
    a: (tagName, attribs) =>
      attribs.target === '_blank'
        ? { tagName, attribs: { ...attribs, rel: 'noopener noreferrer' } }
        : { tagName, attribs },
  },
};

export function cleanHtml(html) {
  if (html === undefined || html === null) return html;
  const cleaned = sanitizeHtml(String(html), OPTIONS).trim();
  // Nothing but empty paragraphs is nothing.
  return cleaned.replace(/<p>(\s|&nbsp;)*<\/p>/g, '').trim() === '' ? '' : cleaned;
}

export default cleanHtml;
