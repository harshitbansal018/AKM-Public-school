'use client';

import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal/Modal';
import Input from '@/components/ui/Input/Input';
import Select from '@/components/ui/Select/Select';
import Textarea from '@/components/ui/Textarea/Textarea';
import ImageUploader from '@/components/admin/ImageUploader/ImageUploader';
import styles from './ResourceForm.module.css';

/**
 * A form built from a field description, shown in a modal.
 *
 * Nine of the twelve admin screens are "a list plus a form", so describing the
 * fields as data means each screen is a short config rather than its own
 * hand-written form with its own state handling and its own bugs.
 *
 * Field: { name, label, type, options?, required?, placeholder?, help?, half? }
 * Types: text | textarea | number | select | checkbox | date | color | list
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
      const empty =
        value === undefined || value === null || String(value).trim() === '' || (Array.isArray(value) && value.length === 0);
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
              {renderField(field, values[field.name], setField, errors[field.name])}
              {field.help ? <small className={styles.help}>{field.help}</small> : null}
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <button type="button" className="btn btn-outline btn-sm" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>
            {busy ? 'Saving…' : submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function renderField(field, value, setField, error) {
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

    case 'select':
      return (
        <Select
          {...common}
          options={field.options ?? []}
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
          value={value ?? ''}
          onChange={(e) => setField(field.name, e.target.value)}
        />
      );
  }
}

/** API value -> form value */
function normaliseIn(field, raw) {
  if (field.type === 'checkbox') return raw ?? field.default ?? false;
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
