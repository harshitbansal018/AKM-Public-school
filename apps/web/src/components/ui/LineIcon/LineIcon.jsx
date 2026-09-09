/**
 * Small stroked line icons, drawn inline as SVG.
 *
 * Inline rather than an icon font or a package: there is no extra request, the
 * stroke follows `currentColor` so a parent's colour is enough to restyle one,
 * and nothing here can go missing the way a hotlinked asset can.
 *
 * Add a new icon by adding one entry to PATHS.
 */
const PATHS = {
  /* speech bubble — sending an enquiry */
  enquiry: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,

  /* school building — visiting the campus */
  campus: (
    <>
      <path d="M3 21h18" />
      <path d="M5 21V9l7-4 7 4v12" />
      <path d="M10 21v-6h4v6" />
      <path d="M9 11.5h.01M15 11.5h.01" />
    </>
  ),

  /* page with lines — submitting documents */
  documents: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M9 13h6M9 17h6" />
    </>
  ),

  /* circled tick — the seat is confirmed */
  seat: (
    <>
      <path d="M22 11.1V12a10 10 0 1 1-5.9-9.1" />
      <path d="M9 11l3 3 9.5-9.5" />
    </>
  ),

  /* calendar — dates and schedules */
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),

  /* pin — a place to visit */
  location: (
    <>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
};

/**
 * @param {object} props
 * @param {string} props.name  a key of PATHS; renders nothing if unknown
 * @param {number} [props.size]
 */
export default function LineIcon({ name, size = 24, className }) {
  const paths = PATHS[name];
  if (!paths) return null;

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths}
    </svg>
  );
}

export const LINE_ICON_NAMES = Object.keys(PATHS);
