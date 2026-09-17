import { AuthProvider } from '@/context/AuthContext';
import AdminShell from '@/components/admin/AdminShell/AdminShell';
import { parentNav } from '@/constants/parentNav';

export const metadata = {
  title: 'Parent Portal — AKM Public Sr. Sec. School',
  robots: { index: false, follow: false },
};

/**
 * Parent portal layout. Same shell as the other portals with its own
 * navigation and its own session (Parent accounts).
 */
export default function ParentLayout({ children }) {
  return (
    <AuthProvider portal="parent">
      <AdminShell
        nav={parentNav}
        brand={{ name: 'AKM Parents', tagline: 'Parent Portal' }}
        title="Parent Portal"
      >
        {children}
      </AdminShell>
    </AuthProvider>
  );
}
