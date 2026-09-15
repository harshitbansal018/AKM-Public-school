import PageHeader from '@/components/ui/PageHeader/PageHeader';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import { getPublicPolicies } from '@/lib/serverApi';
export const metadata = { title: 'School Policies' };
export default async function PoliciesPage() { const items = await getPublicPolicies(); return <><PageHeader title="School Policies" subtitle="Current policies and guidelines." /><section className="section"><div className="container">{items.length ? items.map((x) => <article key={x.id} className="card" style={{ marginBottom: 16, padding: 22 }}><h2>{x.title}</h2>{x.effectiveDate ? <p>Effective: {new Date(x.effectiveDate).toLocaleDateString('en-IN')}</p> : null}<p style={{ whiteSpace: 'pre-wrap' }}>{x.content}</p></article>) : <EmptyState icon="📋" title="No policies published" description="Please contact the school for policy information." />}</div></section></>; }
