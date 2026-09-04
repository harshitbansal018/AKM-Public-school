/**
 * Admin sidebar.
 *
 * `adminOnly` hides an item from EDITOR accounts. It is a convenience, not a
 * security control — the API independently returns 403, which is what actually
 * enforces it.
 */
export const adminNav = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/admin/enquiries', label: 'Enquiries', icon: '📥' },
  { href: '/admin/notices', label: 'Notices', icon: '📌' },
  { href: '/admin/announcements', label: 'Ticker', icon: '📢' },
  { href: '/admin/gallery', label: 'Gallery', icon: '🖼️' },
  { href: '/admin/achievements', label: 'Achievements', icon: '🏆' },
  { href: '/admin/faculty', label: 'Faculty', icon: '👩‍🏫' },
  { href: '/admin/facilities', label: 'Facilities', icon: '🏫' },
  { href: '/admin/streams', label: 'Streams', icon: '📚' },
  { href: '/admin/stages', label: 'Academic Stages', icon: '🎓' },
  { href: '/admin/downloads', label: 'Downloads', icon: '📄' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
  { href: '/admin/users', label: 'Users', icon: '👤', adminOnly: true },
];

export default adminNav;
