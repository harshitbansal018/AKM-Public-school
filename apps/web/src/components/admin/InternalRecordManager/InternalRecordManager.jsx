'use client';

import ResourceManager from '@/components/admin/ResourceManager/ResourceManager';

/** Reusable CRUD screen for private school-management records. */
export default function InternalRecordManager(props) {
  return <ResourceManager serverPagination={props.endpoint.startsWith('/admin/')} {...props} />;
}
