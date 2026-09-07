'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/adminApi';
import { API_ENABLED } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { formatLongDate } from '@/lib/format';
import StatCard from '@/components/admin/StatCard/StatCard';
import StatusPill from '@/components/admin/StatusPill/StatusPill';
import styles from './dashboard.module.css';

const EMPTY = {
  newEnquiries: 0,
  totalEnquiries: 0,
  publishedNotices: 0,
  galleryAlbums: 0,
  users: 0,
  recentEnquiries: [],
};

const SHORTCUTS = [
  { href: '/admin/notices', icon: '📌', label: 'Post a notice' },
  { href: '/admin/gallery', icon: '🖼️', label: 'Add photos' },
  { href: '/admin/announcements', icon: '📢', label: 'Edit announcements' },
  { href: '/admin/settings', icon: '📝', label: 'Edit website content ' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(EMPTY);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!API_ENABLED) return;
    adminApi
      .get('/admin/dashboard')
      .then((data) => setStats({ ...EMPTY, ...data }))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <h1 className={styles.heading}>
        Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
      </h1>
      <p className={styles.sub}>Here is what is happening on the website right now.</p>

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.grid}>
        <Link href="/admin/enquiries" className={styles.statLink}>
          <StatCard icon="📥" label="New enquiries" value={stats.newEnquiries} hint="Not yet contacted" tone="red" />
        </Link>
        <Link href="/admin/enquiries" className={styles.statLink}>
          <StatCard icon="📊" label="Total enquiries" value={stats.totalEnquiries} hint="All time" tone="royal" />
        </Link>
        <Link href="/admin/notices" className={styles.statLink}>
          <StatCard icon="📌" label="Published notices" value={stats.publishedNotices} tone="gold" />
        </Link>
        <Link href="/admin/gallery" className={styles.statLink}>
          <StatCard icon="🖼️" label="Gallery albums" value={stats.galleryAlbums} tone="green" />
        </Link>
      </div>

      <div className={styles.columns}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2>Latest enquiries</h2>
            <Link href="/admin/enquiries">View all →</Link>
          </div>

          {stats.recentEnquiries.length === 0 ? (
            <p className={styles.none}>No enquiries yet.</p>
          ) : (
            <ul className={styles.enquiries}>
              {stats.recentEnquiries.map((enquiry) => (
                <li key={enquiry.id}>
                  <div>
                    <b>{enquiry.parentName}</b>
                    <span>
                      {enquiry.phone} · {formatLongDate(enquiry.createdAt)}
                    </span>
                  </div>
                  <StatusPill value={enquiry.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2>Common tasks</h2>
          </div>
          <ul className={styles.shortcuts}>
            {SHORTCUTS.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>
                  <span aria-hidden="true">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className={styles.note}>
            Anything you change here appears on the public website within a few seconds — there is
            nothing to publish or re-upload.
          </p>
        </section>
      </div>
    </div>
  );
}
