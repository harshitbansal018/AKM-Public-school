'use client';

import ResourceManager from '@/components/admin/ResourceManager/ResourceManager';
import StatusPill from '@/components/admin/StatusPill/StatusPill';

export default function StreamsAdminPage() {
  return (
    <ResourceManager
      endpoint="/admin/streams"
      title="Streams"
      singular="stream"
      description="Subject streams offered in Classes 11 and 12."
      emptyIcon="📚"
      columns={[
        { key: 'emoji', label: '', width: '54px', render: (r) => <span style={{ fontSize: '1.4rem' }}>{r.emoji}</span> },
        { key: 'title', label: 'Stream' },
        {
          key: 'subjects',
          label: 'Subjects',
          render: (r) => (Array.isArray(r.subjects) ? r.subjects.length : 0) + ' listed',
        },
        {
          key: 'isPublished',
          label: 'Status',
          width: '110px',
          render: (r) => <StatusPill value={r.isPublished ? 'published' : 'draft'} label={r.isPublished ? 'Live' : 'Hidden'} />,
        },
      ]}
      fields={[
        { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Science — Medical' },
        { name: 'slug', label: 'URL slug', type: 'text', required: true, half: true, placeholder: 'science-medical', help: 'Lowercase letters, numbers and hyphens.' },
        { name: 'emoji', label: 'Icon', type: 'text', half: true, placeholder: '🩺' },
        { name: 'description', label: 'Description', type: 'textarea', required: true, rows: 3 },
        {
          name: 'subjects',
          label: 'Subjects',
          type: 'list',
          required: true,
          rows: 4,
          help: 'One per line. Each becomes a ticked bullet on the website.',
        },
        { name: 'sortOrder', label: 'Order', type: 'number', half: true },
        { name: 'isPublished', label: 'Show on the website', type: 'checkbox', default: true },
      ]}
    />
  );
}
