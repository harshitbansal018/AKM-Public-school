import PublicShell from '@/components/layout/PublicShell';

/** Wraps every visitor-facing page in the site chrome. */
export default function PublicLayout({ children }) {
  return <PublicShell>{children}</PublicShell>;
}
