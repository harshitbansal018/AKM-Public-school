import { redirect } from 'next/navigation';

/** /admin is not a screen of its own — send visitors to the dashboard. */
export default function AdminIndexPage() {
  redirect('/admin/dashboard');
}
