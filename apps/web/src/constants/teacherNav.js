/**
 * Teacher panel navigation.
 *
 * Teachers only see the academic and account areas
 * available to their role.
 */

export const teacherNav = [
  {
    label: 'Overview',
    items: [
      {
        href: '/teacher/dashboard',
        label: 'Dashboard',
        icon: 'dashboard',
      },
    ],
  },

  {
    label: 'Academic',
    items: [
      {
        href: '/teacher/classes',
        label: 'My Classes',
        icon: 'campus',
      },
      {
        href: '/teacher/students',
        label: 'My Students',
        icon: 'graduation',
      },
      {
        href: '/teacher/homework',
        label: 'Homework',
        icon: 'pencil',
      },
      {
        href: '/teacher/results',
        label: 'Results',
        icon: 'chart',
      },
    ],
  },

  {
    label: 'Account',
    items: [
      {
        href: '/teacher/profile',
        label: 'My Profile',
        icon: 'user',
      },
      {
        href: '/teacher/salary',
        label: 'My Salary',
        icon: 'banknote',
      },
    ],
  },
];

export default teacherNav;