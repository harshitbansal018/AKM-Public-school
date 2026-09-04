import { AuthProvider } from '@/context/AuthContext';
import AdminShell from '@/components/admin/AdminShell/AdminShell';

export const metadata = {
  title: 'Admin — AKM Public Sr. Sec. School',
  robots: { index: false, follow: false },
};

/** Admin panel layout. No public chrome — the sidebar shell replaces it. */
export default function AdminLayout({ children }) {
  return (
    <AuthProvider>
      <AdminShell>{children}</AdminShell>
    </AuthProvider>
  );
}
