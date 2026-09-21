import { Suspense } from 'react';
import LoginCard from '@/components/admin/LoginCard/LoginCard';
import { ResetPasswordForm } from '@/components/forms/PasswordResetForms/PasswordResetForms';
import { Loader } from '@/components/ui/Spinner/Spinner';

export const metadata = {
  title: 'Reset Password — AKM Admin',
  robots: { index: false, follow: false },
};

/** Opened from the emailed link; the token is read from the URL on the client. */
export default function AdminResetPasswordPage() {
  return (
    <LoginCard
      brand="AKM Admin"
      tagline="Content Manager"
      heading="Choose a new password"
      intro="Pick a password of at least 8 characters with a letter and a number."
    >
      <Suspense fallback={<Loader label="Loading…" size="sm" />}>
        <ResetPasswordForm />
      </Suspense>
    </LoginCard>
  );
}
