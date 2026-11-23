/** Stable defaults used until the CMS settings have been loaded. */
export const navLinks = [
  { href: '/', label: 'Home' },
  {
    href: '/about', label: 'About',
    children: [
      { href: '/about', label: 'About Our School' },
      { href: '/faculty', label: 'Faculty & Staff' },
      { href: '/careers', label: 'Careers' },
      { href: '/privacy-policy', label: 'Policies' },
    ],
  },
  { href: '/academics', label: 'Academics' },
  { href: '/admissions', label: 'Admissions' },
  { href: '/facilities', label: 'Campus' },
  { href: '/achievements', label: 'Achievements' },
  {
    href: '/notices', label: 'News & Events',
    children: [
      { href: '/notices', label: 'News & Notices' },
      { href: '/gallery', label: 'Gallery' },
      { href: '/downloads', label: 'Downloads' },
    ],
  },
  { href: '/contact', label: 'Contact' },
];

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
  { href: '/careers', label: 'Careers' },
];
export const footerLegalLinks = [
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms & Conditions' },
  { href: '/disclaimer', label: 'Disclaimer' },
];

const encodeLinks = (items) => items.map(({ label, href }) => `${label}::${href}`).join('|');

export function cmsHref(value, fallback = '/') {
  const href = String(value ?? '').trim();
  return /^(\/(?!\/)|#|https?:\/\/|mailto:|tel:)/i.test(href) ? href : fallback;
}

export const DEFAULT_LINK_SETTINGS = {
  nav_before_about: encodeLinks([navLinks[0]]),
  nav_about_label: navLinks[1].label,
  nav_about_href: navLinks[1].href,
  nav_about_children: encodeLinks(navLinks[1].children),
  nav_between_groups: encodeLinks(navLinks.slice(2, 6)),
  nav_news_label: navLinks[6].label,
  nav_news_href: navLinks[6].href,
  nav_news_children: encodeLinks(navLinks[6].children),
  nav_after_news: encodeLinks(navLinks.slice(7)),
  footer_quick_links: encodeLinks(footerQuickLinks),
  footer_info_links: encodeLinks(footerInfoLinks),
  footer_legal_links: encodeLinks(footerLegalLinks),
};

function links(value, fallback) {
  const parsed = String(value ?? '').split('|').map((row) => {
    const separator = row.indexOf('::');
    if (separator < 1) return null;
    const label = row.slice(0, separator).trim();
    const href = cmsHref(row.slice(separator + 2), '');
    return label && href ? { label, href } : null;
  }).filter(Boolean);
  return parsed.length ? parsed : fallback;
}

export function buildNavLinks(settings = {}) {
  return [
    ...links(settings.nav_before_about, [navLinks[0]]),
    {
      label: settings.nav_about_label || navLinks[1].label,
      href: cmsHref(settings.nav_about_href, navLinks[1].href),
      children: links(settings.nav_about_children, navLinks[1].children),
    },
    ...links(settings.nav_between_groups, navLinks.slice(2, 6)),
    {
      label: settings.nav_news_label || navLinks[6].label,
      href: cmsHref(settings.nav_news_href, navLinks[6].href),
      children: links(settings.nav_news_children, navLinks[6].children),
    },
    ...links(settings.nav_after_news, navLinks.slice(7)),
  ];
}

export function buildFooterLinks(settings = {}) {
  return {
    quick: links(settings.footer_quick_links, footerQuickLinks),
    info: links(settings.footer_info_links, footerInfoLinks),
    legal: links(settings.footer_legal_links, footerLegalLinks),
  };
}

export const allNavHrefs = navLinks.flatMap((item) =>
  item.children ? item.children.map((child) => child.href) : [item.href]
);

export default navLinks;
