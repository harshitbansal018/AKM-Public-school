/**
 * Builds a CSV that Excel opens cleanly.
 *
 * A leading =, +, - or @ makes Excel treat a cell as a formula, so those are
 * prefixed with a quote. Quotes are doubled per RFC 4180. The BOM makes Excel
 * read the file as UTF-8 so names are not mangled.
 */
export function escapeCsv(value) {
  if (value === null || value === undefined) return '';
  let text = value instanceof Date ? value.toISOString().slice(0, 10) : String(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

/**
 * @param {{label: string}[]} columns
 * @param {any[][]} rows  one array of cell values per row, in column order
 */
export function toCsv(columns, rows) {
  const lines = [
    columns.map((column) => escapeCsv(column.label)).join(','),
    ...rows.map((cells) => cells.map(escapeCsv).join(',')),
  ];
  return `﻿${lines.join('\r\n')}`;
}

export default toCsv;
