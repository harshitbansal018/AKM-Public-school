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
        icon: 'dashboard',
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
        icon: 'settings',
      },
      {
        href: '/admin/notices',
        label: 'Notices',
        icon: 'bookmark',
      },
      {
        href: '/admin/announcements',
        label: 'Announcements',
        icon: 'megaphone',
      },
      {
        href: '/admin/gallery',
        label: 'Gallery',
        icon: 'image',
      },
      {
        href: '/admin/achievements',
        label: 'Achievements',
        icon: 'trophy',
      },
      {
        href: '/admin/facilities',
        label: 'Facilities',
        icon: 'campus',
      },
      {
        href: '/admin/downloads',
        label: 'Downloads',
        icon: 'documents',
      },
      { href: '/admin/about', label: 'About Us', icon: 'info' },
      { href: '/admin/policies', label: 'Policies', icon: 'clipboard' },
    ],
  },

  // ─────────────────────────────────────
  // ACADEMIC MANAGEMENT
  // ─────────────────────────────────────
  {
    label: 'Academic Management',
    items: [
      { href: '/admin/students', label: 'Students', icon: 'graduation' },
      { href: '/admin/parents', label: 'Parents', icon: 'users' },
      {
        href: '/admin/faculty',
        label: 'Teachers / Faculty',
        icon: 'teacher',
      },
      {
        href: '/admin/streams',
        label: 'Streams',
        icon: 'library',
      },
      {
        href: '/admin/stages',
        label: 'Academic Stages',
        icon: 'layers',
      },
      { href: '/admin/homework', label: 'Homework', icon: 'pencil' },
      { href: '/admin/results', label: 'Results', icon: 'chart' },
    ],
  },

  // ─────────────────────────────────────
  // FINANCE
  // ─────────────────────────────────────
  {
    label: 'Finance',
    items: [
      { href: '/admin/fees', label: 'Fees', icon: 'wallet' },
      { href: '/admin/faculty-salary', label: 'Faculty Salary', icon: 'banknote' },
    ],
  },
  {
    label: 'Recruitment',
    items: [
      { href: '/admin/job-applications', label: 'Job Applications', icon: 'briefcase' },
      {
        href: '/admin/enquiries',
        label: 'Enquiries',
        icon: 'inbox',
      },
    ],
  },
  {
    label: 'Reports',
    items: [{ href: '/admin/reports', label: 'Reports / Print', icon: 'printer' }],
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
        icon: 'user',
        adminOnly: true,
      },
    ],
  },
];

export default adminNav;
