/**
 * Parent portal navigation. The section pages show the selected child (the
 * switcher at the top of each page picks between children) and remember the
 * choice as the parent moves between Homework, Results and Fees.
 */
export const parentNav = [
  {
    label: 'Overview',
    items: [{ href: '/parent/dashboard', label: 'My Children', icon: 'users' }],
  },
  {
    label: 'My Child',
    items: [
      { href: '/parent/homework', label: 'Homework', icon: 'pencil' },
      { href: '/parent/results', label: 'Results', icon: 'chart' },
      { href: '/parent/fees', label: 'Fees', icon: 'wallet' },
    ],
  },
];

export default parentNav;
