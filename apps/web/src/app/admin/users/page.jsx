'use client';

import ResourceManager from '@/components/admin/ResourceManager/ResourceManager';
import StatusPill from '@/components/admin/StatusPill/StatusPill';
import { formatLongDate } from '@/lib/format';
import { useAuth } from '@/context/AuthContext';

/**
 * Admin accounts. Only an ADMIN can open this — the API returns 403 for
 * editors, and the sidebar link is hidden for them.
 */
export default function UsersAdminPage() {
  const { user } = useAuth();

  return (
    <ResourceManager
      endpoint="/admin/users"
      title="Users"
      singular="user"
      description="Who can sign in to this panel. Editors can manage content; administrators can also manage accounts."
      emptyIcon="👤"
      // You cannot delete yourself, and the API refuses to remove the last admin.
      canDelete={(row) => row.id !== user?.id}
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        {
          key: 'role',
          label: 'Role',
          width: '110px',
          render: (r) => <StatusPill value={r.role === 'ADMIN' ? 'active' : 'sky'} label={r.role} />,
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
        { name: 'name', label: 'Full name', type: 'text', required: true, half: true },
        { name: 'email', label: 'Email', type: 'text', required: true, half: true },
        {
          name: 'password',
          label: 'Password',
          type: 'text',
          help: 'At least 8 characters with a letter and a number. Leave blank when editing to keep the current one.',
        },
        {
          name: 'role',
          label: 'Role',
          type: 'select',
          half: true,
          options: [
            { value: 'EDITOR', label: 'Editor — content only' },
            { value: 'ADMIN', label: 'Administrator — content + accounts' },
          ],
        },
        { name: 'isActive', label: 'Account is active', type: 'checkbox', default: true },
      ]}
    />
  );
}
