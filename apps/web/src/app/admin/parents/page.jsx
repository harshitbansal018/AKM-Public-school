'use client';

import ResourceManager from '@/components/admin/ResourceManager/ResourceManager';
import StatusPill from '@/components/admin/StatusPill/StatusPill';
import { formatLongDate } from '@/lib/format';

/**
 * Parent-portal logins. One account per family — link each child to it from
 * the student's record under Students.
 */
export default function ParentsAdminPage() {
  return (
    <ResourceManager
      endpoint="/admin/parents"
      title="Parents"
      searchKeys={['name', 'email', 'phone']}
      searchPlaceholder="Search by name, email or phone…"
      singular="parent account"
      description="Logins for the parent portal. Create the account here, then open each child under Students and choose this parent — they will only ever see their own children."
      emptyDescription="Add a parent account, then link their children from the Students page."
      columns={[
        { key: 'name', label: 'Parent' },
        { key: 'email', label: 'Login email' },
        { key: 'phone', label: 'Phone' },
        {
          key: 'childrenCount',
          label: 'Children',
          width: '100px',
          render: (r) => (r.childrenCount ? `${r.childrenCount} linked` : 'None yet'),
        },
        {
          key: 'lastLoginAt',
          label: 'Last signed in',
          nowrap: true,
          render: (r) => (r.lastLoginAt ? formatLongDate(r.lastLoginAt) : 'Never'),
        },
        {
          key: 'isActive',
          label: 'Status',
          width: '100px',
          render: (r) => <StatusPill value={r.isActive ? 'active' : 'inactive'} label={r.isActive ? 'Active' : 'Off'} />,
        },
      ]}
      fields={[
        { name: 'name', label: 'Parent / guardian name', type: 'text', required: true, half: true },
        { name: 'phone', label: 'Phone', type: 'text', half: true },
        { name: 'email', label: 'Login email', type: 'text', required: true },
        {
          name: 'password',
          label: 'Password',
          type: 'text',
          help: 'At least 8 characters with a letter and a number. Leave blank when editing to keep the current one.',
        },
        {
          name: 'isActive',
          label: 'Account is active',
          type: 'checkbox',
          default: true,
          help: 'Untick to stop this parent signing in without deleting anything.',
        },
      ]}
    />
  );
}
