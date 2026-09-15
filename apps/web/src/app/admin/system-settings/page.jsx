import { redirect } from 'next/navigation';

/** School identity and global settings are managed in Website Content. */
export default function SystemSettingsPage() {
  redirect('/admin/settings?section=identity');
}
