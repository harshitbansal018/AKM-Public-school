/**
 * Admin sidebar navigation.
 *
 * `adminOnly` is UI-level visibility only.
 * Backend/API permissions must independently enforce access.
 */

export const adminNav = [
  // ─────────────────────────────────────
  // OVERVIEW
  // ─────────────────────────────────────
  {
    label: 'Overview',
    items: [
      {
        href: '/admin/dashboard',
        label: 'Dashboard',
        icon: '📊',
      },
    ],
  },

  // ─────────────────────────────────────
  // WEBSITE CONTENT
  // ─────────────────────────────────────
  {
    label: 'Website Content',
    items: [
      {
        href: '/admin/settings',
        label: 'Site Settings',
        icon: '⚙️',
      },
      {
        href: '/admin/notices',
        label: 'Notices',
        icon: '📌',
      },
      {
        href: '/admin/announcements',
        label: 'Announcements',
        icon: '📢',
      },
      {
        href: '/admin/gallery',
        label: 'Gallery',
        icon: '🖼️',
      },
      {
        href: '/admin/achievements',
        label: 'Achievements',
        icon: '🏆',
      },
      {
        href: '/admin/facilities',
        label: 'Facilities',
        icon: '🏫',
      },
      {
        href: '/admin/downloads',
        label: 'Downloads',
        icon: '📄',
      },
      { href: '/admin/about', label: 'About Us', icon: 'ℹ️' },
      { href: '/admin/policies', label: 'Policies', icon: '📋' },
    ],
  },

  // ─────────────────────────────────────
  // ACADEMIC MANAGEMENT
  // ─────────────────────────────────────
  {
    label: 'Academic Management',
    items: [
      { href: '/admin/students', label: 'Students', icon: '👨‍🎓' },
      {
        href: '/admin/faculty',
        label: 'Teachers / Faculty',
        icon: '👩‍🏫',
      },
      {
        href: '/admin/streams',
        label: 'Streams',
        icon: '📚',
      },
      {
        href: '/admin/stages',
        label: 'Academic Stages',
        icon: '🎓',
      },
      { href: '/admin/homework', label: 'Homework', icon: '📝' },
      { href: '/admin/results', label: 'Results', icon: '📊' },
    ],
  },

  // ─────────────────────────────────────
  // FINANCE
  // ─────────────────────────────────────
  {
    label: 'Finance',
    items: [
      { href: '/admin/fees', label: 'Fees', icon: '💰' },
      { href: '/admin/faculty-salary', label: 'Faculty Salary', icon: '💵' },
    ],
  },
  {
    label: 'Recruitment',
    items: [
      { href: '/admin/job-applications', label: 'Job Applications', icon: '📄' },
      {
        href: '/admin/enquiries',
        label: 'Enquiries',
        icon: '📥',
      },
    ],
  },
  {
    label: 'Reports',
    items: [{ href: '/admin/reports', label: 'Reports / Print', icon: '🖨️' }],
  },

  // ─────────────────────────────────────
  // SYSTEM
  // ─────────────────────────────────────
  {
    label: 'System',
    items: [
      {
        href: '/admin/users',
        label: 'Users & Permissions',
        icon: '👤',
        adminOnly: true,
      },
      { href: '/admin/system-settings', label: 'System Settings', icon: '⚙️', adminOnly: true },
    ],
  },
];

export default adminNav;
