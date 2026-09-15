'use client';
import InternalRecordManager from '@/components/admin/InternalRecordManager/InternalRecordManager';
export default function PoliciesPage() {
  return <InternalRecordManager endpoint="/admin/policies" title="Policies" singular="policy" description="Maintain internal school policies and their current version." columns={[{ key: 'title', label: 'Policy' }, { key: 'effectiveDate', label: 'Effective date' }, { key: 'status', label: 'Status' }]} fields={[{ name: 'title', label: 'Policy title', type: 'text', required: true }, { name: 'effectiveDate', label: 'Effective date', type: 'date', half: true }, { name: 'status', label: 'Status', type: 'select', half: true, options: [{ value: 'DRAFT', label: 'Draft' }, { value: 'ACTIVE', label: 'Active' }, { value: 'ARCHIVED', label: 'Archived' }] }, { name: 'content', label: 'Policy content', type: 'textarea', rows: 8, required: true }]} />;
}
