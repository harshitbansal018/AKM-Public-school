import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
export const metadata = { title: 'Fee Information' };
export default function FeesPage() { return <><PageHeader title="Fee Information" subtitle="For fee structure, due dates, and payment assistance." /><section className="section"><div className="container"><div className="card" style={{ padding: 28 }}><h2>Please contact the school office</h2><p>Fee records are private and are not displayed publicly. Contact the office for your child’s fee details and payment options.</p><Link className="btn btn-primary" href="/contact">Contact us</Link></div></div></section></>; }
