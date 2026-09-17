import LoginCard from '@/components/admin/LoginCard/LoginCard';

export const metadata = {
  title: 'Sign In — AKM Teacher Portal',
  robots: { index: false, follow: false },
};

export default function TeacherLoginPage() {
  return (
    <LoginCard
      brand="AKM Teacher"
      tagline="Teacher Portal"
      intro="Use the teacher login set up on your faculty record by the school administrator."
    />
  );
}
