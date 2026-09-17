'use client';

import ResourceManager from '@/components/admin/ResourceManager/ResourceManager';
import StatusPill from '@/components/admin/StatusPill/StatusPill';
import LineIcon from '@/components/ui/LineIcon/LineIcon';
import { medalIcons } from '@/constants/contentIcons';

export default function AchievementsAdminPage() {
  return (
    <ResourceManager
      endpoint="/admin/achievements"
      title="Achievements"
      singular="achievement"
      description="Board toppers, sports wins and cultural prizes shown on the Results page."
      columns={[
        { key: 'medal', label: '', width: '54px', render: (r) => <LineIcon name={r.medal} fallback="medal-gold" size={22} /> },
        { key: 'studentName', label: 'Name' },
        { key: 'classLabel', label: 'Class', nowrap: true },
        { key: 'score', label: 'Score', nowrap: true },
        { key: 'year', label: 'Year', width: '80px' },
        {
          key: 'isFeatured',
          label: 'Status',
          width: '110px',
          render: (r) => <StatusPill value={r.isFeatured ? 'published' : 'draft'} label={r.isFeatured ? 'Live' : 'Hidden'} />,
        },
      ]}
      fields={[
        { name: 'studentName', label: 'Student name', type: 'text', required: true, placeholder: 'Anjali Thakur' },
        { name: 'classLabel', label: 'Class', type: 'text', half: true, placeholder: 'Class 12' },
        { name: 'score', label: 'Score', type: 'text', half: true, placeholder: '94.2%', help: 'Free text — "94.2%" or "12+".' },
        { name: 'description', label: 'Description', type: 'textarea', rows: 3, placeholder: 'School topper, Science (Medical), HPBOSE Board 2026' },
        { name: 'medal', label: 'Medal', type: 'select', half: true, options: medalIcons, placeholder: 'Choose a medal…' },
        { name: 'year', label: 'Year', type: 'number', half: true, placeholder: '2026' },
        {
          name: 'type',
          label: 'Category',
          type: 'select',
          half: true,
          options: [
            { value: 'academic', label: 'Academic' },
            { value: 'sports', label: 'Sports' },
            { value: 'cultural', label: 'Cultural' },
          ],
        },
        { name: 'sortOrder', label: 'Order', type: 'number', half: true },
        { name: 'isFeatured', label: 'Show on the website', type: 'checkbox', default: true },
      ]}
    />
  );
}
