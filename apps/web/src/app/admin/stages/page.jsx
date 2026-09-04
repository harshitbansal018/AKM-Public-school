'use client';

import ResourceManager from '@/components/admin/ResourceManager/ResourceManager';
import StatusPill from '@/components/admin/StatusPill/StatusPill';

export default function StagesAdminPage() {
  return (
    <ResourceManager
      endpoint="/admin/academic-stages"
      title="Academic Stages"
      singular="stage"
      description="Pre-Primary through Senior Secondary — the five cards on the Academics page."
      emptyIcon="🎓"
      columns={[
        { key: 'emoji', label: '', width: '54px', render: (r) => <span style={{ fontSize: '1.4rem' }}>{r.emoji}</span> },
        { key: 'title', label: 'Stage' },
        { key: 'classRange', label: 'Classes', nowrap: true },
        {
          key: 'accentColor',
          label: 'Colour',
          width: '90px',
          render: (r) => (
            <span
              title={r.accentColor}
              style={{
                display: 'inline-block',
                width: 26,
                height: 26,
                borderRadius: 6,
                background: r.accentColor,
                border: '1px solid rgba(0,0,0,.12)',
              }}
            />
          ),
        },
        {
          key: 'isPublished',
          label: 'Status',
          width: '110px',
          render: (r) => <StatusPill value={r.isPublished ? 'published' : 'draft'} label={r.isPublished ? 'Live' : 'Hidden'} />,
        },
      ]}
      fields={[
        { name: 'title', label: 'Title', type: 'text', required: true, half: true, placeholder: 'Primary' },
        { name: 'classRange', label: 'Class range', type: 'text', required: true, half: true, placeholder: 'Classes 1 – 5' },
        { name: 'description', label: 'Description', type: 'textarea', required: true, rows: 3 },
        { name: 'emoji', label: 'Icon', type: 'text', half: true, placeholder: '📖' },
        { name: 'accentColor', label: 'Accent colour', type: 'color', half: true, help: 'The card top border.' },
        { name: 'sortOrder', label: 'Order', type: 'number', half: true },
        { name: 'isPublished', label: 'Show on the website', type: 'checkbox', default: true },
      ]}
    />
  );
}
