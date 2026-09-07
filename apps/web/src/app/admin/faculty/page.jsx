'use client';

import ResourceManager from '@/components/admin/ResourceManager/ResourceManager';
import StatusPill from '@/components/admin/StatusPill/StatusPill';

export default function FacultyAdminPage() {
  return (
    <ResourceManager
      endpoint="/admin/faculty"
      title="Faculty"
      singular="staff member"
      description="Teaching staff. The person marked as Principal supplies the message shown on the homepage."
      emptyIcon="👩‍🏫"
      columns={[
        {
          key: 'photo',
          label: '',
          width: '64px',
          render: (r) =>
            r.photo ? (
              // eslint-disable-next-line @next/next/no-img-element -- small admin thumbnail
              <img
                src={r.photo}
                alt=""
                style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: '50%' }}
              />
            ) : (
              <span style={{ color: 'var(--muted)', fontSize: '1.2rem' }}>👤</span>
            ),
        },
        { key: 'name', label: 'Name' },
        { key: 'designation', label: 'Designation' },
        { key: 'subject', label: 'Subject' },
        {
          key: 'isPrincipal',
          label: 'Role',
          width: '110px',
          render: (r) => (r.isPrincipal ? <StatusPill value="active" label="Principal" /> : '—'),
        },
        {
          key: 'isPublished',
          label: 'Status',
          width: '110px',
          render: (r) => <StatusPill value={r.isPublished ? 'published' : 'draft'} label={r.isPublished ? 'Live' : 'Hidden'} />,
        },
      ]}
      fields={[
        {
          name: 'photo',
          label: 'Photo',
          type: 'image',
          folder: 'faculty',
          hint: 'Shown on the homepage for the Principal. A square photo works best · max 5 MB.',
        },
        { name: 'name', label: 'Name', type: 'text', required: true, half: true, placeholder: 'Mrs. Sunita Sharma' },
        { name: 'designation', label: 'Designation', type: 'text', required: true, half: true, placeholder: 'Principal' },
        { name: 'qualification', label: 'Heading / qualification', type: 'text', help: 'Used as the heading above the principal message.' },
        { name: 'subject', label: 'Subject taught', type: 'text', half: true },
        { name: 'sortOrder', label: 'Order', type: 'number', half: true },
        { name: 'message', label: 'Message', type: 'textarea', rows: 5, help: 'Shown on the homepage when this person is the Principal.' },
        { name: 'isPrincipal', label: 'This is the Principal', type: 'checkbox' },
        { name: 'isPublished', label: 'Show on the website', type: 'checkbox', default: true },
      ]}
    />
  );
}
