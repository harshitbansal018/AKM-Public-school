'use client';

import ResourceManager from '@/components/admin/ResourceManager/ResourceManager';
import StatusPill from '@/components/admin/StatusPill/StatusPill';
import { IMAGE_RULE } from '@/constants/uploads';
import { useClassSections } from '@/hooks/useClassSections';
import LineIcon from '@/components/ui/LineIcon/LineIcon';

export default function FacultyAdminPage() {
  const classOptions = useClassSections();

  return (
    <ResourceManager
      endpoint="/admin/faculty"
      title="Faculty"
      singular="staff member"
      description="Teaching staff. The people ticked as Principal and MD supply the two messages on the homepage and About page. Teacher portal sign-in is set up on each record here."
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
              <span style={{ color: 'var(--muted)' }}><LineIcon name="user" size={24} /></span>
            ),
        },
        { key: 'name', label: 'Name' },
        { key: 'designation', label: 'Designation' },
        { key: 'subject', label: 'Subject' },
        {
          key: 'isPrincipal',
          label: 'Role',
          width: '110px',
          render: (r) => {
            if (r.isPrincipal) return <StatusPill value="active" label="Principal" />;
            if (r.isDirector) return <StatusPill value="active" label="MD" />;
            return '—';
          },
        },
        {
          key: 'teacherAccess',
          label: 'Teacher portal',
          width: '130px',
          render: (r) =>
            r.teacherAccess ? (
              <StatusPill value="active" label={r.assignedClasses?.length ? `${r.assignedClasses.length} class(es)` : 'No classes'} />
            ) : (
              '—'
            ),
        },
        {
          key: 'isPublished',
          label: 'Website',
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
          hint: `Shown on the homepage for the Principal and the MD. A square photo works best · ${IMAGE_RULE}.`,
        },
        { name: 'name', label: 'Name', type: 'text', required: true, half: true, placeholder: 'Mrs. Sunita Sharma' },
        { name: 'designation', label: 'Designation', type: 'text', required: true, half: true, placeholder: 'Principal' },
        { name: 'qualification', label: 'Heading / qualification', type: 'text', help: "Used as the heading above the Principal's or MD's message." },
        { name: 'subject', label: 'Subject taught', type: 'text', half: true },
        { name: 'sortOrder', label: 'Order', type: 'number', half: true },
        { name: 'message', label: 'Message', type: 'textarea', rows: 5, help: 'Shown on the homepage when this person is the Principal or the MD.' },
        { name: 'isPrincipal', label: 'This is the Principal', type: 'checkbox' },
        {
          name: 'isDirector',
          label: 'This is the Managing Director (MD)',
          type: 'checkbox',
          help: 'Tick one person only. Someone ticked as both is treated as the Principal.',
        },
        { name: 'isPublished', label: 'Show on the website', type: 'checkbox', default: true },

        // ---- teacher portal sign-in (this faculty record is the account) ----
        {
          name: 'teacherAccess',
          label: 'Allow teacher portal access',
          type: 'checkbox',
          help: 'Needs a login email and password below. Untick to suspend their sign-in without deleting anything.',
        },
        { name: 'accountEmail', label: 'Login email', type: 'text', half: true, placeholder: 'teacher@akmpublicschool.in' },
        {
          name: 'password',
          label: 'Login password',
          type: 'text',
          half: true,
          help: 'At least 8 characters with a letter and a number. Leave blank when editing to keep the current one.',
        },
        {
          name: 'assignedClasses',
          label: 'Assigned classes',
          type: 'checkboxes',
          options: classOptions,
          help: 'The teacher can only see students and set homework/results for the classes ticked here. The list is managed under Website content → Classes & sections.',
        },
      ]}
    />
  );
}
