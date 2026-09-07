'use client';

import ResourceManager from '@/components/admin/ResourceManager/ResourceManager';
import StatusPill from '@/components/admin/StatusPill/StatusPill';

export default function FacilitiesAdminPage() {
  return (
    <ResourceManager
      endpoint="/admin/facilities"
      title="Facilities"
      singular="facility"
      description="The campus cards shown on the homepage and the Campus page."
      emptyIcon="🏫"
      columns={[
        { key: 'icon', label: '', width: '54px', render: (r) => <span style={{ fontSize: '1.4rem' }}>{r.icon}</span> },
        { key: 'title', label: 'Title' },
        { key: 'description', label: 'Description' },
        {
          key: 'isPublished',
          label: 'Status',
          width: '110px',
          render: (r) => <StatusPill value={r.isPublished ? 'published' : 'draft'} label={r.isPublished ? 'Live' : 'Hidden'} />,
        },
      ]}
      fields={[
        { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Computer & IT Lab' },
        { name: 'icon', label: 'Icon', type: 'text', half: true, placeholder: '💻', help: 'A single emoji.' },
        { name: 'sortOrder', label: 'Order', type: 'number', half: true, help: 'Lower numbers appear first.' },
        { name: 'description', label: 'Description', type: 'textarea', required: true, rows: 3 },
        {
          name: 'image',
          label: 'Photo (optional)',
          type: 'image',
          folder: 'misc',
          hint: 'Leave empty to show the emoji icon instead.',
        },
        { name: 'isPublished', label: 'Show on the website', type: 'checkbox', default: true },
      ]}
    />
  );
}
