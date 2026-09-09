/**
 * Main navigation.
 *
 * An item with `children` becomes a dropdown; its own `href` is still a real
 * page, so the parent stays clickable rather than being a dead label.
 *
 * Grouping keeps the top row to eight items — beyond that the header runs out
 * of width and the labels start wrapping.
 */
export const navLinks = [
  { href: '/', label: 'Home' },
  {
    href: '/about',
    label: 'About',
    children: [
      { href: '/about', label: 'About Our School' },
      { href: '/faculty', label: 'Faculty & Staff' },
    ],
  },
  { href: '/academics', label: 'Academics' },
  { href: '/admissions', label: 'Admissions' },
  { href: '/facilities', label: 'Campus' },
  { href: '/achievements', label: 'Achievements' },
  {
    href: '/notices',
    label: 'News & Events',
    children: [
      { href: '/notices', label: 'News & Notices' },
      { href: '/gallery', label: 'Gallery' },
      { href: '/downloads', label: 'Downloads' },
    ],
  },
  { href: '/contact', label: 'Contact' },
];

/** Flat list of every page the nav can reach — used to sanity-check coverage. */
export const allNavHrefs = navLinks.flatMap((item) =>
  item.children ? item.children.map((c) => c.href) : [item.href]
);

export const footerQuickLinks = [
  { href: '/about', label: 'About Us' },
  { href: '/academics', label: 'Academics' },
  { href: '/admissions', label: 'Admissions' },
  { href: '/faculty', label: 'Faculty & Staff' },
  { href: '/facilities', label: 'Campus & Facilities' },
  { href: '/gallery', label: 'Gallery' },
];

export const footerInfoLinks = [
  { href: '/notices', label: 'News & Notices' },
  { href: '/achievements', label: 'Results & Toppers' },
  { href: '/downloads', label: 'Downloads' },
  { href: '/contact', label: 'Contact Us' },
];

export const footerLegalLinks = [
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms & Conditions' },
  { href: '/disclaimer', label: 'Disclaimer' },
];

export default navLinks;
