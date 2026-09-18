'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { teacherApi } from '@/lib/adminApi';
import { API_ENABLED } from '@/lib/api';
import AdminPage from '@/components/admin/AdminPage/AdminPage';
import StatCard from '@/components/admin/StatCard/StatCard';
import Spinner from '@/components/ui/Spinner/Spinner';
import dashboard from '@/app/admin/dashboard/dashboard.module.css';
import styles from './profile.module.css';

const EMPTY = { studentsCount: 0, homeworkCount: 0, resultCount: 0 };

/** "Mrs. Sunita Sharma" → "SS" for the photo placeholder. */
function initialsOf(name = '') {
  return name
    .replace(/^(mr|mrs|ms|dr|miss)\.?\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

/** The faculty record behind this sign-in, as the school has it on file. */
export default function TeacherProfilePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(EMPTY);
  const [loading, setLoading] = useState(API_ENABLED);

  useEffect(() => {
    if (!API_ENABLED) return;
    teacherApi
      .get('/teacher/dashboard')
      .then((data) => setStats({ ...EMPTY, ...data }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!user) return null;
  const classes = user.assignedClasses ?? [];

  return (
    <AdminPage
      title="My Profile"
      description="Your details as they appear on the school's faculty record."
    >
      <div className={styles.layout}>
        <section className={styles.card} aria-label="Identity">
          <div className={styles.banner} />
          <div className={styles.photoWrap}>
            {user.photo ? (
              // eslint-disable-next-line @next/next/no-img-element -- uploaded photo served by the API
              <img src={user.photo} alt={user.name} className={styles.photo} />
            ) : (
              <span className={styles.initials} aria-hidden="true">
                {initialsOf(user.name)}
              </span>
            )}
          </div>
          <div className={styles.body}>
            <h2 className={styles.name}>{user.name}</h2>
            <p className={styles.designation}>{user.designation}</p>
            {user.qualification ? <p className={styles.qualification}>{user.qualification}</p> : null}
            <span className={styles.badge}>Teacher</span>
          </div>
        </section>

        <div className={styles.stack}>
          <div className={dashboard.grid}>
            <StatCard icon="campus" label="Classes" value={classes.length} tone="royal" />
            <StatCard icon="graduation" label="Students" value={loading ? <Spinner size="sm" /> : stats.studentsCount} tone="green" />
            <StatCard icon="pencil" label="Homework set" value={loading ? <Spinner size="sm" /> : stats.homeworkCount} tone="gold" />
            <StatCard icon="chart" label="Results entered" value={loading ? <Spinner size="sm" /> : stats.resultCount} tone="red" />
          </div>

          <section className={styles.panel}>
            <h2>Details</h2>
            <dl className={styles.details}>
              <div>
                <dt>Login email</dt>
                <dd>{user.email}</dd>
              </div>
              <div>
                <dt>Designation</dt>
                <dd>{user.designation || '—'}</dd>
              </div>
              <div>
                <dt>Subject</dt>
                <dd>{user.subject || '—'}</dd>
              </div>
              <div>
                <dt>Qualification</dt>
                <dd>{user.qualification || '—'}</dd>
              </div>
            </dl>
          </section>

          <section className={styles.panel}>
            <h2>Assigned classes</h2>
            {classes.length ? (
              <div className={styles.chips}>
                {classes.map((name) => (
                  <span key={name} className={styles.chip}>
                    {name}
                  </span>
                ))}
              </div>
            ) : (
              <p className={styles.none}>No classes assigned yet.</p>
            )}
            <p className={styles.note}>
              To change your photo, details, classes or password, please contact the school
              administrator — they are managed from your faculty record.
            </p>
          </section>
        </div>
      </div>
    </AdminPage>
  );
}
