/**
 * Icons the admin can pick for content cards (facilities, academic stages,
 * streams, achievement medals). The *name* is what gets stored on the record;
 * the public website shows the matching emoji (the look the school chose), and
 * the admin panel previews the same choice as a line icon (<LineIcon>).
 */
const CONTENT = [
  ['school', 'School building', '🏫'],
  ['laptop', 'Computer / IT', '💻'],
  ['flask', 'Science lab', '🧪'],
  ['microscope', 'Microscope / research', '🔬'],
  ['library', 'Library / books', '📚'],
  ['book', 'Open book / reading', '📖'],
  ['pencil', 'Writing / study', '📝'],
  ['graduation', 'Graduation cap', '🎓'],
  ['blocks', 'Play / pre-primary', '🧸'],
  ['sports', 'Sports & games', '🏸'],
  ['bus', 'Transport', '🚌'],
  ['music', 'Music', '🎵'],
  ['art', 'Art & craft', '🎨'],
  ['medical', 'Medical', '🩺'],
  ['gear', 'Engineering / non-medical', '⚙️'],
  ['briefcase', 'Commerce / careers', '💼'],
  ['star', 'Star', '⭐'],
  ['trophy', 'Trophy', '🏆'],
];

const MEDALS = [
  ['medal-gold', 'Gold medal', '🥇'],
  ['medal-silver', 'Silver medal', '🥈'],
  ['medal-bronze', 'Bronze medal', '🥉'],
  ['trophy', 'Trophy', '🏆'],
];

const toOptions = (rows) => rows.map(([value, label]) => ({ value, label }));

/** Dropdown options for facility, stage and stream forms. */
export const contentIcons = toOptions(CONTENT);

/** Dropdown options for the achievement form. */
export const medalIcons = toOptions(MEDALS);

const EMOJI = Object.fromEntries([...CONTENT, ...MEDALS].map(([value, , emoji]) => [value, emoji]));

/**
 * The emoji shown on the public website for a stored icon name. A value that
 * is not a known name (older rows, or an emoji stored before names existed)
 * is shown as-is when it is a single character, else the fallback.
 */
export function contentEmoji(name, fallback = 'school') {
  if (EMOJI[name]) return EMOJI[name];
  if (name && !/^[a-z-]+$/.test(name)) return name;
  return EMOJI[fallback] ?? fallback;
}
