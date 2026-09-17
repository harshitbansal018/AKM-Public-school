'use client';

import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  ClassicEditor,
  Essentials,
  Paragraph,
  Heading,
  Bold,
  Italic,
  Underline,
  Link,
  List,
  BlockQuote,
  Table,
  TableToolbar,
  Undo,
} from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';
import styles from './RichTextEditor.module.css';

/**
 * CKEditor 5 for long-form content (policies, the full text of a notice).
 *
 * Deliberately a small toolbar: headings, emphasis, links, lists, quotes and
 * tables — what a school notice or rule book needs, and nothing the public
 * page cannot render. The API sanitises the HTML again on save, so whatever
 * arrives here is never trusted on its own.
 *
 * Loaded only in the browser (see ResourceForm) — CKEditor needs `window`.
 */
const CONFIG = {
  licenseKey: 'GPL',
  plugins: [Essentials, Paragraph, Heading, Bold, Italic, Underline, Link, List, BlockQuote, Table, TableToolbar, Undo],
  toolbar: [
    'heading',
    '|',
    'bold',
    'italic',
    'underline',
    '|',
    'link',
    'bulletedList',
    'numberedList',
    'blockQuote',
    'insertTable',
    '|',
    'undo',
    'redo',
  ],
  heading: {
    options: [
      { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
      { model: 'heading2', view: 'h2', title: 'Heading', class: 'ck-heading_heading2' },
      { model: 'heading3', view: 'h3', title: 'Sub-heading', class: 'ck-heading_heading3' },
    ],
  },
  link: {
    addTargetToExternalLinks: true,
    defaultProtocol: 'https://',
  },
  table: {
    contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'],
  },
};

/**
 * @param {object} props
 * @param {string} props.id
 * @param {string} [props.label]
 * @param {string} props.value       HTML
 * @param {(html: string) => void} props.onChange
 * @param {string} [props.error]
 * @param {boolean} [props.required]
 */
export default function RichTextEditor({ id, label, value, onChange, error, required }) {
  return (
    <div className={styles.field}>
      {label ? (
        <label className={styles.label} htmlFor={id}>
          {label}
          {required ? (
            <span className={styles.required} aria-hidden="true">
              {' '}
              *
            </span>
          ) : null}
        </label>
      ) : null}
      <div className={error ? styles.invalid : undefined} id={id}>
        <CKEditor
          editor={ClassicEditor}
          config={CONFIG}
          data={value ?? ''}
          onChange={(_event, editor) => onChange(editor.getData())}
        />
      </div>
      {error ? (
        <span className={styles.error} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
