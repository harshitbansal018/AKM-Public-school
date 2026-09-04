'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/adminApi';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/cn';
import AdminPage from '@/components/admin/AdminPage/AdminPage';
import Input from '@/components/ui/Input/Input';
import Textarea from '@/components/ui/Textarea/Textarea';
import styles from './settings.module.css';

const GROUP_LABELS = {
  general: 'General & homepage',
  contact: 'Contact details',
  stats: 'Homepage counters',
  social: 'Social links',
  seo: 'Search engine',
};

/** Long values get a textarea instead of a single-line input. */
const LONG_KEYS = new Set([
  'hero_description',
  'addressFull',
  'admission_description',
  'admission_points',
  'hero_image_caption',
]);

export default function SettingsAdminPage() {
  const toast = useToast();
  const [groups, setGroups] = useState({});
  const [values, setValues] = useState({});
  const [active, setActive] = useState('contact');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await adminApi.get('/admin/settings');
        setGroups(data);

        const flat = {};
        for (const rows of Object.values(data)) {
          for (const row of rows) flat[row.key] = row.value;
        }
        setValues(flat);

        // Open a tab that actually has content.
        const first = Object.keys(data)[0];
        if (first && !data.contact) setActive(first);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    const rows = groups[active] ?? [];
    const changed = rows
      .filter((row) => values[row.key] !== row.value)
      .map((row) => ({
        key: row.key,
        value: String(values[row.key] ?? ''),
        group: row.group,
        label: row.label,
      }));

    if (changed.length === 0) {
      toast.info('Nothing has changed');
      return;
    }

    setSaving(true);
    try {
      await adminApi.put('/admin/settings', { settings: changed });
      // Keep the baseline in sync so the next save only sends new edits.
      setGroups((current) => ({
        ...current,
        [active]: current[active].map((row) =>
          changed.find((c) => c.key === row.key) ? { ...row, value: values[row.key] } : row
        ),
      }));
      toast.success(`${changed.length} setting(s) saved — the website updates immediately`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminPage title="Settings">
        <p className={styles.loading}>Loading settings…</p>
      </AdminPage>
    );
  }

  if (error) {
    return (
      <AdminPage title="Settings">
        <p className={styles.error}>{error}</p>
      </AdminPage>
    );
  }

  const tabs = Object.keys(groups);
  const rows = groups[active] ?? [];

  return (
    <AdminPage
      title="Settings"
      description="Phone numbers, address, timings and the homepage text. Changes appear on the website straight away."
      action={
        <button type="button" className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      }
    >
      <div className={styles.tabs}>
        {tabs.map((group) => (
          <button
            key={group}
            type="button"
            className={cn(styles.tab, active === group && styles.activeTab)}
            onClick={() => setActive(group)}
          >
            {GROUP_LABELS[group] ?? group}
            <span className={styles.count}>{groups[group].length}</span>
          </button>
        ))}
      </div>

      <div className={styles.panel}>
        {rows.length === 0 ? (
          <p className={styles.loading}>Nothing in this group.</p>
        ) : (
          <div className={styles.fields}>
            {rows.map((row) => {
              const isLong = LONG_KEYS.has(row.key);
              const Field = isLong ? Textarea : Input;
              return (
                <div key={row.key} className={cn(isLong && styles.wide)}>
                  <Field
                    id={row.key}
                    label={row.label || row.key}
                    value={values[row.key] ?? ''}
                    rows={isLong ? 3 : undefined}
                    onChange={(e) => setValues((c) => ({ ...c, [row.key]: e.target.value }))}
                  />
                  <small className={styles.key}>{row.key}</small>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className={styles.footNote}>
        Tip: <strong>admission_points</strong> is a single field — separate each bullet with a
        vertical bar <code>|</code>.
      </p>
    </AdminPage>
  );
}
