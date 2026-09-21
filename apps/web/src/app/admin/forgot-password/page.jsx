import LoginCard from '@/components/admin/LoginCard/LoginCard';
import { ForgotPasswordForm } from '@/components/forms/PasswordResetForms/PasswordResetForms';

export const metadata = {
  title: 'Forgot Password — AKM Admin',
  robots: { index: false, follow: false },
};

export default function AdminForgotPasswordPage() {
  return (
    <LoginCard
      brand="AKM Admin"
      tagline="Content Manager"
      heading="Forgot your password?"
      intro="Enter the email you sign in with and we will send you a link to choose a new password."
    >
      <ForgotPasswordForm />
    </LoginCard>
  );
}
