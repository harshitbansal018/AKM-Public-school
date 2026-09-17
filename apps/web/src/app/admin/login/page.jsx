import LoginCard from '@/components/admin/LoginCard/LoginCard';

export const metadata = {
  title: 'Sign In — AKM Admin',
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <LoginCard
      brand="AKM Admin"
      tagline="Content Manager"
      intro="Use the account created for you by the school administrator."
    />
  );
}
