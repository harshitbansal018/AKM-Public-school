'use client';
import { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
import { apiPost } from '@/lib/api';
export default function CareersPage() {
  const [status, setStatus] = useState('');
  const submit = async (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); try { await apiPost('/job-applications', Object.fromEntries(form)); event.currentTarget.reset(); setStatus('Thank you — your application has been received.'); } catch (error) { setStatus(error.message); } };
  return <><PageHeader title="Careers" subtitle="Join our teaching and support team." /><section className="section"><div className="container"><form className="card" style={{ padding: 28, maxWidth: 700 }} onSubmit={submit}><h2>Apply for a position</h2><p><label>Name<br /><input name="name" required /></label></p><p><label>Position<br /><input name="position" required /></label></p><p><label>Email<br /><input name="email" type="email" /></label></p><p><label>Phone<br /><input name="phone" /></label></p><p><label>Message / experience<br /><textarea name="notes" rows="5" /></label></p><input name="website" tabIndex="-1" autoComplete="off" style={{ display: 'none' }} /><button className="btn btn-primary">Submit application</button>{status ? <p role="status">{status}</p> : null}</form></div></section></>;
}
