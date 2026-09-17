import { AuthProvider } from '@/context/AuthContext';
import AdminShell from '@/components/admin/AdminShell/AdminShell';
import { teacherNav } from '@/constants/teacherNav';

export const metadata = {
  title: 'Teacher Portal — AKM Public Sr. Sec. School',
  robots: { index: false, follow: false },
};

/**
 * Teacher portal layout. Same shell as the admin panel with its own navigation
 * and its own session (faculty accounts, not admin users).
 */
export default function TeacherLayout({ children }) {
  return (
    <AuthProvider portal="teacher">
      <AdminShell
        nav={teacherNav}
        brand={{ name: 'AKM Teacher', tagline: 'Teacher Portal' }}
        title="Teacher Portal"
      >
        {children}
      </AdminShell>
    </AuthProvider>
  );
}
