import LoginCard from '@/components/admin/LoginCard/LoginCard';

export const metadata = {
  title: 'Sign In — AKM Parent Portal',
  robots: { index: false, follow: false },
};

export default function ParentLoginPage() {
  return (
    <LoginCard
      brand="AKM Parents"
      tagline="Parent Portal"
      intro="Use the parent login given to you by the school office to see your child's homework, results and fees."
    />
  );
}
