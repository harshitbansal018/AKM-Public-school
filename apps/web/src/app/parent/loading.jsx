import { Loader } from '@/components/ui/Spinner/Spinner';

/** Shown while a portal page's code and data load after a sidebar click. */
export default function Loading() {
  return <Loader minHeight="60vh" />;
}
