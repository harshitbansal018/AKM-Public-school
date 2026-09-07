'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/adminApi';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/cn';
import { cmsPages, mappedKeys } from '@/constants/cmsContent';
import { toPairs } from '@/lib/content';
import AdminPage from '@/components/admin/AdminPage/AdminPage';
import Input from '@/components/ui/Input/Input';
import Textarea from '@/components/ui/Textarea/Textarea';
import ImageUploader from '@/components/admin/ImageUploader/ImageUploader';
import styles from './settings.module.css';

/**
 * Website content editor.
 *
 * Organised the way the school thinks about the site — by page, then by the
 * section you can actually see on it — rather than by the database's technical
 * grouping. cmsContent.js holds that map; this screen just renders it.
 *
 * Edits are kept across page switches and saved together, so moving between
 * "Homepage" and "Contact details" never silently loses work.
 */
export default function SettingsAdminPage() {
  const toast = useToast();
  const [rows, setRows] = useState([]); // flat list from the API
  const [values, setValues] = useState({}); // current edits
  const [baseline, setBaseline] = useState({}); // last saved state
  const [activePage, setActivePage] = useState(cmsPages[0].id);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const grouped = await adminApi.get('/admin/settings');
        const flat = Object.values(grouped).flat();
        setRows(flat);

        const map = {};
        for (const row of flat) map[row.key] = row.value;
        setValues(map);
        setBaseline(map);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const rowByKey = useMemo(() => {
    const map = {};
    for (const row of rows) map[row.key] = row;
    return map;
  }, [rows]);

  /** Keys in the database that the CMS map does not describe. */
  const orphanKeys = useMemo(
    () => rows.map((r) => r.key).filter((key) => !mappedKeys.has(key)),
    [rows]
  );

  const changedKeys = useMemo(
    () => Object.keys(values).filter((key) => values[key] !== baseline[key]),
    [values, baseline]
  );

  const setValue = (key, value) => setValues((current) => ({ ...current, [key]: value }));

  const save = async () => {
    if (changedKeys.length === 0) {
      toast.info('Nothing has changed yet');
      return;
    }

    setSaving(true);
    try {
      await adminApi.put('/admin/settings', {
        settings: changedKeys.map((key) => ({
          key,
          value: String(values[key] ?? ''),
          group: rowByKey[key]?.group,
          label: rowByKey[key]?.label,
        })),
      });
      setBaseline(values);
      toast.success(
        `Saved — the website is already showing ${changedKeys.length === 1 ? 'the change' : 'these changes'}`
      );
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const discard = () => {
    setValues(baseline);
    toast.info('Changes discarded');
  };

  if (loading) {
    return (
      <AdminPage title="Website content">
        <p className={styles.loading}>Loading…</p>
      </AdminPage>
    );
  }

  if (error) {
    return (
      <AdminPage title="Website content">
        <p className={styles.error}>{error}</p>
      </AdminPage>
    );
  }

  const page = cmsPages.find((p) => p.id === activePage) ?? cmsPages[0];

  return (
    <AdminPage
      title="Website content"
      description="Pick a page on the left, then edit the section you want to change. Saved changes appear on the website within a few seconds."
      action={
        <>
          {changedKeys.length > 0 ? (
            <button type="button" className="btn btn-outline btn-sm" onClick={discard} disabled={saving}>
              Discard
            </button>
          ) : null}
          <button type="button" className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
            {saving
              ? 'Saving…'
              : changedKeys.length > 0
                ? `Save ${changedKeys.length} change${changedKeys.length === 1 ? '' : 's'}`
                : 'Save changes'}
          </button>
        </>
      }
    >
      {changedKeys.length > 0 ? (
        <div className={styles.unsaved} role="status">
          You have {changedKeys.length} unsaved change{changedKeys.length === 1 ? '' : 's'}.
          They are kept while you move between pages — nothing is lost until you press Discard.
        </div>
      ) : null}

      <div className={styles.layout}>
        <nav className={styles.pageNav} aria-label="Website pages">
          {cmsPages.map((item) => {
            const dirty = item.sections
              .flatMap((s) => s.fields.map((f) => f.key))
              .some((key) => changedKeys.includes(key));

            return (
              <button
                key={item.id}
                type="button"
                className={cn(styles.pageTab, activePage === item.id && styles.pageTabActive)}
                onClick={() => setActivePage(item.id)}
              >
                <span className={styles.pageIcon} aria-hidden="true">
                  {item.icon}
                </span>
                <span className={styles.pageLabel}>{item.label}</span>
                {dirty ? <span className={styles.dot} title="Unsaved changes" /> : null}
              </button>
            );
          })}

          {orphanKeys.length > 0 ? (
            <button
              type="button"
              className={cn(styles.pageTab, activePage === '__other' && styles.pageTabActive)}
              onClick={() => setActivePage('__other')}
            >
              <span className={styles.pageIcon} aria-hidden="true">
                ⚙️
              </span>
              <span className={styles.pageLabel}>Other</span>
            </button>
          ) : null}
        </nav>

        <div className={styles.content}>
          {activePage === '__other' ? (
            <OtherSection
              keys={orphanKeys}
              rowByKey={rowByKey}
              values={values}
              setValue={setValue}
            />
          ) : (
            <>
              <header className={styles.pageHead}>
                <div>
                  <h2>{page.label}</h2>
                  <p>{page.description}</p>
                </div>
                <Link href={page.href} target="_blank" className={styles.viewLink}>
                  View page ↗
                </Link>
              </header>

              {page.sections.map((section) => (
                <section key={section.id} className={styles.section}>
                  <div className={styles.sectionHead}>
                    <h3>{section.label}</h3>
                    {section.help ? <p>{section.help}</p> : null}
                  </div>

                  <div className={styles.fields}>
                    {section.fields.map((field) => (
                      <Field
                        key={field.key}
                        field={field}
                        value={values[field.key] ?? ''}
                        changed={changedKeys.includes(field.key)}
                        onChange={(v) => setValue(field.key, v)}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </>
          )}
        </div>
      </div>
    </AdminPage>
  );
}

function Field({ field, value, changed, onChange }) {
  const wrapper = cn(field.half ? styles.half : styles.full, changed && styles.changed);

  if (field.type === 'image') {
    return (
      <div className={cn(styles.full, changed && styles.changed)}>
        <ImageUploader
          label={field.label}
          folder={field.folder ?? 'misc'}
          value={value}
          hint={field.help}
          onChange={(path) => onChange(path ?? '')}
        />
      </div>
    );
  }

  if (field.type === 'map') {
    return (
      <div className={cn(styles.full, changed && styles.changed)}>
        <MapField field={field} value={value} onChange={onChange} />
      </div>
    );
  }

  if (field.type === 'pairs') {
    return (
      <div className={cn(styles.full, changed && styles.changed)}>
        <PairsEditor field={field} value={value} onChange={onChange} />
      </div>
    );
  }

  if (field.type === 'lines') {
    // One row in the database, pipe separated; one item per line to edit.
    return (
      <div className={wrapper}>
        <Textarea
          id={field.key}
          label={field.label}
          rows={field.rows ?? 4}
          value={String(value).split('|').join('\n')}
          onChange={(e) =>
            onChange(
              e.target.value
                .split('\n')
                .map((line) => line.trim())
                .filter(Boolean)
                .join('|')
            )
          }
        />
        {field.help ? <small className={styles.help}>{field.help}</small> : null}
      </div>
    );
  }

  const Control = field.type === 'textarea' ? Textarea : Input;

  return (
    <div className={wrapper}>
      <Control
        id={field.key}
        label={field.label}
        type={field.type === 'number' ? 'number' : 'text'}
        rows={field.type === 'textarea' ? (field.rows ?? 3) : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {field.help ? <small className={styles.help}>{field.help}</small> : null}
    </div>
  );
}

/**
 * Google Map embed, with a live preview.
 *
 * Accepts the whole <iframe> block Google gives you as well as a bare embed
 * URL — the src is pulled out here so the preview updates as you paste, and
 * the API does the same on save. A share link is rejected by the API, because
 * Google refuses to frame those and the map would just render blank.
 */
function MapField({ field, value, onChange }) {
  const src = extractMapSrc(value);
  const looksEmbeddable = /^https:\/\/(www\.)?google\.[a-z.]+\/maps\/embed/i.test(src);

  return (
    <div>
      <Textarea
        id={field.key}
        label={field.label}
        rows={3}
        placeholder={'<iframe src="https://www.google.com/maps/embed?pb=..." ...></iframe>'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      <details className={styles.howto}>
        <summary>How do I get this?</summary>
        <ol>
          <li>Open Google Maps and search for the school.</li>
          <li>
            Click <strong>Share</strong>, then the <strong>Embed a map</strong> tab.
          </li>
          <li>
            Click <strong>COPY HTML</strong> and paste it in the box above.
          </li>
        </ol>
        <p>
          The plain “Copy link” option will not work — Google blocks those from being shown
          inside another website.
        </p>
      </details>

      {src ? (
        looksEmbeddable ? (
          <div className={styles.mapPreview}>
            <span className={styles.previewLabel}>Preview</span>
            <iframe src={src} title="Map preview" loading="lazy" />
          </div>
        ) : (
          <p className={styles.mapWarn} role="alert">
            That looks like a share link rather than an embed link, so the map would show as a
            blank box. Use <strong>Share → Embed a map → COPY HTML</strong>.
          </p>
        )
      ) : null}
    </div>
  );
}

/** Pulls src out of a pasted iframe, or returns the value if it is already a URL. */
function extractMapSrc(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  const match = raw.match(/src\s*=\s*["']([^"']+)["']/i);
  return (match ? match[1] : raw).trim();
}

/**
 * Repeatable "heading + explanation" list — the admission steps and the About
 * page values. Stored in one row as "Title::Body|Title::Body", but edited as
 * proper rows so nobody has to type separator characters correctly.
 */
function PairsEditor({ field, value, onChange }) {
  const items = toPairs(value);

  const write = (next) =>
    onChange(
      next
        .filter((item) => item.title.trim() || item.description.trim())
        .map((item) => `${item.title.trim()}::${item.description.trim()}`)
        .join('|')
    );

  const update = (index, patch) =>
    write(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  const remove = (index) => write(items.filter((_, i) => i !== index));

  const move = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    write(next);
  };

  return (
    <div>
      <span className={styles.pairsLabel}>{field.label}</span>

      <ol className={styles.pairs}>
        {items.map((item, index) => (
          <li key={index} className={styles.pair}>
            <span className={styles.pairNumber}>{index + 1}</span>

            <div className={styles.pairFields}>
              <Input
                id={`${field.key}-${index}-title`}
                label={field.titleLabel ?? 'Title'}
                value={item.title}
                onChange={(e) => update(index, { title: e.target.value })}
              />
              <Textarea
                id={`${field.key}-${index}-body`}
                label={field.bodyLabel ?? 'Description'}
                rows={2}
                value={item.description}
                onChange={(e) => update(index, { description: e.target.value })}
              />
            </div>

            <div className={styles.pairTools}>
              <button type="button" onClick={() => move(index, -1)} disabled={index === 0} title="Move up">
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === items.length - 1}
                title="Move down"
              >
                ↓
              </button>
              <button
                type="button"
                className={styles.pairRemove}
                onClick={() => remove(index)}
                title="Remove"
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ol>

      <button
        type="button"
        className="btn btn-outline btn-sm"
        onClick={() => write([...items, { title: '', description: '' }])}
      >
        + Add {(field.titleLabel ?? 'item').toLowerCase()}
      </button>

      {field.help ? <small className={styles.help}>{field.help}</small> : null}
    </div>
  );
}

/** Anything in the database the CMS map does not know about, so it stays editable. */
function OtherSection({ keys, rowByKey, values, setValue }) {
  return (
    <>
      <header className={styles.pageHead}>
        <div>
          <h2>Other settings</h2>
          <p>
            Values stored in the database that are not part of a page above. Usually safe to leave
            alone.
          </p>
        </div>
      </header>

      <section className={styles.section}>
        <div className={styles.fields}>
          {keys.map((key) => (
            <div key={key} className={styles.full}>
              <Input
                id={key}
                label={rowByKey[key]?.label || key}
                value={values[key] ?? ''}
                onChange={(e) => setValue(key, e.target.value)}
              />
              <small className={styles.key}>{key}</small>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
