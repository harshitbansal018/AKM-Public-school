'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { teacherApi } from '@/lib/adminApi';
import { API_ENABLED } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { formatLongDate } from '@/lib/format';
import StatCard from '@/components/admin/StatCard/StatCard';
import LineIcon from '@/components/ui/LineIcon/LineIcon';
import StatusPill from '@/components/admin/StatusPill/StatusPill';
import { Loader } from '@/components/ui/Spinner/Spinner';
// Same layout as the admin dashboard, so it shares that stylesheet.
import styles from '@/app/admin/dashboard/dashboard.module.css';

const EMPTY = {
  classes: [],
  studentsCount: 0,
  homeworkCount: 0,
  resultCount: 0,
  recentHomework: [],
};

const SHORTCUTS = [
  { href: '/teacher/homework', icon: 'pencil', label: 'Set homework' },
  { href: '/teacher/results', icon: 'chart', label: 'Enter results' },
  { href: '/teacher/students', icon: 'graduation', label: 'View my students' },
];

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(EMPTY);
  const [loading, setLoading] = useState(API_ENABLED);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!API_ENABLED) return;
    teacherApi
      .get('/teacher/dashboard')
      .then((data) => setStats({ ...EMPTY, ...data }))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className={styles.heading}>
        Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
      </h1>
      <p className={styles.sub}>
        {stats.classes.length
          ? `You are assigned to ${stats.classes.join(', ')}.`
          : 'No classes have been assigned to you yet — please ask the school administrator.'}
      </p>

      {error ? <p className={styles.error}>{error}</p> : null}
      {loading ? <Loader label="Loading dashboard…" /> : null}

      <div className={styles.grid} hidden={loading}>
        <Link href="/teacher/classes" className={styles.statLink}>
          <StatCard icon="campus" label="My classes" value={stats.classes.length} tone="royal" />
        </Link>
        <Link href="/teacher/students" className={styles.statLink}>
          <StatCard icon="graduation" label="My students" value={stats.studentsCount} hint="In your classes" tone="green" />
        </Link>
        <Link href="/teacher/homework" className={styles.statLink}>
          <StatCard icon="pencil" label="Homework" value={stats.homeworkCount} hint="For your classes" tone="gold" />
        </Link>
        <Link href="/teacher/results" className={styles.statLink}>
          <StatCard icon="chart" label="Results" value={stats.resultCount} hint="For your classes" tone="red" />
        </Link>
      </div>

      <div className={styles.columns} hidden={loading}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2>Latest homework</h2>
            <Link href="/teacher/homework">View all →</Link>
          </div>

          {stats.recentHomework.length === 0 ? (
            <p className={styles.none}>No homework set yet.</p>
          ) : (
            <ul className={styles.enquiries}>
              {stats.recentHomework.map((item) => (
                <li key={item.id}>
                  <div>
                    <b>{item.title}</b>
                    <span>
                      {item.classGroup} · {item.subject}
                      {item.dueDate ? ` · Due ${formatLongDate(item.dueDate)}` : ''}
                    </span>
                  </div>
                  <StatusPill
                    value={item.isPublished ? 'published' : 'draft'}
                    label={item.isPublished ? 'Published' : 'Draft'}
                  />
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
                  <LineIcon name={item.icon} size={18} />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
