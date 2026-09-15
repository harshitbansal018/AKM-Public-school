import PageHeader from '@/components/ui/PageHeader/PageHeader';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import { getPublicHomework } from '@/lib/serverApi';
export const metadata = { title: 'Homework' };
export default async function HomeworkPage() { const items = await getPublicHomework(); return <><PageHeader title="Homework" subtitle="Published assignments and due dates." /><section className="section"><div className="container">{items.length ? items.map((x) => <article key={x.id} className="card" style={{ marginBottom: 16, padding: 22 }}><h2>{x.title}</h2><p><b>{x.classGroup}</b> · {x.subject} {x.dueDate ? `· Due ${new Date(x.dueDate).toLocaleDateString('en-IN')}` : ''}</p><p>{x.description}</p></article>) : <EmptyState icon="📝" title="No homework published" description="Please check again later." />}</div></section></>; }
