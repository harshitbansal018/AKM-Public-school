import { redirect } from 'next/navigation';

/** Homework is private and available only through the authenticated parent portal. */
export default function HomeworkRedirectPage() {
  redirect('/parent/homework');
}
