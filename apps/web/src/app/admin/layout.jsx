import { AuthProvider } from '@/context/AuthContext';
import AdminShell from '@/components/admin/AdminShell/AdminShell';
import { adminNav } from '@/constants/adminNav';

export const metadata = {
  title: 'Admin — AKM Public Sr. Sec. School',
  robots: { index: false, follow: false },
};

/** Admin panel layout. No public chrome — the sidebar shell replaces it. */
export default function AdminLayout({ children }) {
  return (
    <AuthProvider portal="admin">
      <AdminShell
        nav={adminNav}
        brand={{ name: 'AKM Admin', tagline: 'Content Manager' }}
        title="Content Manager"
      >
        {children}
      </AdminShell>
    </AuthProvider>
  );
}
