'use client';

import ResourceManager from '@/components/admin/ResourceManager/ResourceManager';
import StatusPill from '@/components/admin/StatusPill/StatusPill';
import { formatLongDate } from '@/lib/format';

/**
 * The scrolling red ticker. Lines can be scheduled — leave the dates blank for
 * one that runs until it is switched off.
 */
export default function AnnouncementsAdminPage() {
  return (
    <ResourceManager
      endpoint="/admin/announcements"
      title="Announcements"
      singular="announcement"
      description="The scrolling red strip at the top of every page."
      emptyIcon="📢"
      columns={[
        { key: 'text', label: 'Announcement' },
        {
          key: 'window',
          label: 'Runs',
          nowrap: true,
          render: (r) => {
            if (!r.startsAt && !r.endsAt) return 'Always';
            const from = r.startsAt ? formatLongDate(r.startsAt) : 'now';
            const to = r.endsAt ? formatLongDate(r.endsAt) : 'until switched off';
            return `${from} → ${to}`;
          },
        },
        { key: 'sortOrder', label: 'Order', width: '80px' },
        {
          key: 'isActive',
          label: 'Status',
          width: '110px',
          render: (r) => <StatusPill value={r.isActive ? 'active' : 'inactive'} label={r.isActive ? 'Live' : 'Off'} />,
        },
      ]}
      fields={[
        {
          name: 'text',
          label: 'Announcement text',
          type: 'textarea',
          required: true,
          rows: 2,
          placeholder: '📢 Admissions open for Session 2026–27',
          help: 'Emoji are welcome — they show in the ticker.',
        },
        { name: 'startsAt', label: 'Start date', type: 'date', half: true, help: 'Optional.' },
        { name: 'endsAt', label: 'End date', type: 'date', half: true, help: 'Optional — it hides itself afterwards.' },
        { name: 'sortOrder', label: 'Order', type: 'number', half: true },
        { name: 'isActive', label: 'Show in the ticker', type: 'checkbox', default: true },
      ]}
    />
  );
}
