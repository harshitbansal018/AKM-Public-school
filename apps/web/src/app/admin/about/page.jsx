import { redirect } from 'next/navigation';

/** About-page copy is managed by the existing Website Content editor. */
export default function AboutAdminPage() {
  redirect('/admin/settings?section=about');
}
