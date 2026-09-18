'use client';

import InternalRecordManager from '@/components/admin/InternalRecordManager/InternalRecordManager';
import StatusPill from '@/components/admin/StatusPill/StatusPill';
import { formatLongDate } from '@/lib/format';
import { usePolicyTabs } from '@/hooks/useClassSections';

const STATUS = {
  ACTIVE: { tone: 'active', label: 'Active — on the website' },
  DRAFT: { tone: 'draft', label: 'Draft' },
  ARCHIVED: { tone: 'inactive', label: 'Archived' },
};

/**
 * School policies. Each is filed under a tab of the website's Policies page
 * (the tabs are set under Website content → Policies page — add as many as
 * you like). Set a policy to Active to show it under its tab.
 */
export default function PoliciesPage() {
  const tabs = usePolicyTabs();

  return (
    <InternalRecordManager
      endpoint="/admin/policies"
      title="Policies"
      singular="policy"
      description="Each policy sits under a tab on the website’s Policies page. Add or rename tabs under Website content → Policies page; set a policy to Active to publish it."
      emptyDescription="Write the school’s rules here, one policy per entry, choose its tab, and set it to Active to publish."
      searchKeys={['title']}
      searchPlaceholder="Search policies…"
      filters={[
        { name: 'category', label: 'Tab', options: tabs, placeholder: 'All tabs' },
        {
          name: 'status',
          label: 'Status',
          placeholder: 'Any status',
          options: [
            { value: 'ACTIVE', label: 'Active' },
            { value: 'DRAFT', label: 'Draft' },
            { value: 'ARCHIVED', label: 'Archived' },
          ],
        },
      ]}
      columns={[
        { key: 'title', label: 'Policy' },
        { key: 'category', label: 'Tab' },
        { key: 'effectiveDate', label: 'Effective from', nowrap: true, render: (r) => (r.effectiveDate ? formatLongDate(r.effectiveDate) : '—') },
        { key: 'updatedAt', label: 'Updated', nowrap: true, render: (r) => formatLongDate(r.updatedAt) },
        {
          key: 'status',
          label: 'Status',
          width: '170px',
          render: (r) => <StatusPill value={STATUS[r.status]?.tone ?? 'sky'} label={STATUS[r.status]?.label ?? r.status} />,
        },
      ]}
      fields={[
        { name: 'title', label: 'Policy title', type: 'text', required: true, placeholder: 'Attendance & Leave Rules 2026–27' },
        {
          name: 'category',
          label: 'Tab on the Policies page',
          type: 'select',
          half: true,
          options: tabs,
          placeholder: 'Choose a tab…',
          required: true,
          help: 'Need a new tab? Add it under Website content → Policies page.',
        },
        { name: 'effectiveDate', label: 'Effective from', type: 'date', half: true },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          half: true,
          options: [
            { value: 'DRAFT', label: 'Draft — not shown' },
            { value: 'ACTIVE', label: 'Active — on the website' },
            { value: 'ARCHIVED', label: 'Archived — kept, not shown' },
          ],
        },
        {
          name: 'content',
          label: 'Policy content',
          type: 'richtext',
          required: true,
          help: 'Use the toolbar for headings, bullet points, numbered lists, links and tables — it appears on the website exactly as written here.',
        },
      ]}
    />
  );
}
