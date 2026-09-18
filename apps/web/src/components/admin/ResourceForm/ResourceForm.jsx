'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Modal from '@/components/ui/Modal/Modal';
import Input from '@/components/ui/Input/Input';
import Select from '@/components/ui/Select/Select';
import Textarea from '@/components/ui/Textarea/Textarea';
import ImageUploader from '@/components/admin/ImageUploader/ImageUploader';
import Spinner from '@/components/ui/Spinner/Spinner';
import styles from './ResourceForm.module.css';

// CKEditor needs the browser, so it is loaded only when a rich-text field is drawn.
const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor/RichTextEditor'), {
  ssr: false,
  loading: () => <Spinner size="sm" label="Loading editor…" />,
});

/**
 * A form built from a field description, shown in a modal.
 *
 * Nine of the twelve admin screens are "a list plus a form", so describing the
 * fields as data means each screen is a short config rather than its own
 * hand-written form with its own state handling and its own bugs.
 *
 * Field: { name, label, type, options?, required?, placeholder?, help?, half? }
 * Types: text | textarea | richtext | number | select | checkbox | checkboxes | date | color | list
 *   checkboxes — pick several of `options`; the value is an array
 *   richtext   — CKEditor; the value is HTML (sanitised again by the API on save)
 *
 * A select's `options` may be a function of the current values, for a list
 * that depends on another field (students in the chosen class, say).
 */
export default function ResourceForm({
  open,
  title,
  fields,
  initialValues = {},
  busy = false,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
}) {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});

  // Re-seed whenever a different row is opened for editing.
  useEffect(() => {
    if (!open) return;
    const seeded = {};
    for (const field of fields) {
      const raw = initialValues[field.name];
      seeded[field.name] = normaliseIn(field, raw);
    }
    setValues(seeded);
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialValues]);

  const setField = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const found = {};
    for (const field of fields) {
      if (!field.required) continue;
      const value = values[field.name];
      // Rich text that is only empty tags (<p></p>) counts as blank.
      const asText =
        field.type === 'richtext' ? String(value ?? '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ') : value;
      const empty =
        asText === undefined || asText === null || String(asText).trim() === '' || (Array.isArray(value) && value.length === 0);
      if (empty) found[field.name] = `${field.label} is required`;
    }

    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    const payload = {};
    for (const field of fields) {
      payload[field.name] = normaliseOut(field, values[field.name]);
    }
    onSubmit(payload);
  };

  return (
    <Modal open={open} onClose={busy ? () => {} : onCancel} title={title} className={styles.panel}>
      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.grid}>
          {fields.map((field) => (
            <div key={field.name} className={field.half ? styles.half : styles.full}>
              {renderField(field, values, setField, errors[field.name])}
              {field.help ? <small className={styles.help}>{field.help}</small> : null}
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <button type="button" className="btn btn-outline btn-sm" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>
            {busy ? (
              <>
                <Spinner size="xs" /> Saving…
              </>
            ) : (
              submitLabel
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function renderField(field, values, setField, error) {
  const value = values[field.name];
  const common = {
    id: field.name,
    label: field.label,
    error,
    placeholder: field.placeholder,
  };

  switch (field.type) {
    case 'textarea':
      return (
        <Textarea
          {...common}
          value={value ?? ''}
          rows={field.rows ?? 4}
          onChange={(e) => setField(field.name, e.target.value)}
        />
      );

    case 'richtext':
      return (
        <RichTextEditor
          {...common}
          value={value ?? ''}
          required={field.required}
          onChange={(html) => setField(field.name, html)}
        />
      );

    case 'select':
      return (
        <Select
          {...common}
          options={(typeof field.options === 'function' ? field.options(values) : field.options) ?? []}
          placeholder={field.placeholder ?? 'Choose…'}
          value={value ?? ''}
          onChange={(e) => setField(field.name, e.target.value)}
        />
      );

    case 'checkbox':
      return (
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => setField(field.name, e.target.checked)}
          />
          <span>{field.label}</span>
        </label>
      );

    case 'checkboxes': {
      const selected = Array.isArray(value) ? value : [];
      const toggle = (option, checked) =>
        setField(
          field.name,
          checked ? [...selected, option] : selected.filter((item) => item !== option)
        );
      return (
        <fieldset className={styles.checkboxGroup}>
          <legend className={styles.checkboxLegend}>{field.label}</legend>
          {(field.options ?? []).length === 0 ? (
            <small className={styles.help}>Nothing to choose from yet.</small>
          ) : null}
          {(field.options ?? []).map((option) => (
            <label key={option.value} className={styles.checkbox}>
              <input
                type="checkbox"
                checked={selected.includes(option.value)}
                onChange={(e) => toggle(option.value, e.target.checked)}
              />
              <span>{option.label}</span>
            </label>
          ))}
          {error ? (
            <span className={styles.fieldError} role="alert">
              {error}
            </span>
          ) : null}
        </fieldset>
      );
    }

    case 'list':
      return (
        <Textarea
          {...common}
          value={value ?? ''}
          rows={field.rows ?? 4}
          onChange={(e) => setField(field.name, e.target.value)}
        />
      );

    case 'image':
      return (
        <ImageUploader
          label={field.label}
          folder={field.folder ?? 'misc'}
          value={value}
          hint={field.hint}
          onChange={(path) => setField(field.name, path)}
        />
      );

    case 'color':
      return (
        <div className={styles.colorRow}>
          <Input
            {...common}
            value={value ?? ''}
            onChange={(e) => setField(field.name, e.target.value)}
          />
          <input
            type="color"
            className={styles.swatch}
            value={/^#[0-9a-fA-F]{6}$/.test(value ?? '') ? value : '#e3a81c'}
            onChange={(e) => setField(field.name, e.target.value)}
            aria-label={`${field.label} colour picker`}
          />
        </div>
      );

    default:
      return (
        <Input
          {...common}
          type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
          min={field.min}
          max={field.max}
          step={field.step}
          value={value ?? ''}
          onChange={(e) => setField(field.name, e.target.value)}
        />
      );
  }
}

/** API value -> form value */
function normaliseIn(field, raw) {
  if (field.type === 'checkbox') return raw ?? field.default ?? false;
  if (field.type === 'checkboxes') return Array.isArray(raw) ? raw : [];
  // The API hands back a full URL for images, but the database should store the
  // relative path — otherwise every stored row breaks when the domain changes.
  if (field.type === 'image') return stripUploadOrigin(raw);
  if (field.type === 'list') return Array.isArray(raw) ? raw.join('\n') : (raw ?? '');
  if (field.type === 'date') return raw ? String(raw).slice(0, 10) : '';
  if (raw === null || raw === undefined) return field.default ?? '';
  return raw;
}

/** "http://host/uploads/faculty/x.jpg" -> "faculty/x.jpg" */
function stripUploadOrigin(value) {
  if (!value) return '';
  const match = String(value).match(/\/uploads\/(.+)$/);
  return match ? match[1] : value;
}

/** Form value -> API value */
function normaliseOut(field, value) {
  if (field.type === 'checkbox') return Boolean(value);
  if (field.type === 'checkboxes') return Array.isArray(value) ? value : [];
  if (field.type === 'image') return stripUploadOrigin(value) || null;
  if (field.type === 'list') {
    return String(value ?? '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  }
  if (field.type === 'number') {
    if (value === '' || value === null || value === undefined) return null;
    return Number(value);
  }
  if (field.type === 'date') return value || null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? (field.emptyAsNull === false ? '' : null) : trimmed;
  }
  return value;
}
