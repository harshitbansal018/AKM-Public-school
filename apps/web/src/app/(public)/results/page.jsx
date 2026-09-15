import PageHeader from '@/components/ui/PageHeader/PageHeader';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import { getPublicResults } from '@/lib/serverApi';
export const metadata = { title: 'Results' };
export default async function ResultsPage() { const items = await getPublicResults(); return <><PageHeader title="Results" subtitle="Published examination results." /><section className="section"><div className="container">{items.length ? items.map((x) => <article key={x.id} className="card" style={{ marginBottom: 16, padding: 22 }}><h2>{x.studentName} — {x.score}</h2><p><b>{x.classGroup}</b> · {x.exam}</p>{x.remarks ? <p>{x.remarks}</p> : null}</article>) : <EmptyState icon="📊" title="No results published" description="Please check again later." />}</div></section></>; }
