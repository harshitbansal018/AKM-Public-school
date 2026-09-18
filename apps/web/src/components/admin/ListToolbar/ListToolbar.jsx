'use client';

import Input from '@/components/ui/Input/Input';
import Select from '@/components/ui/Select/Select';
import styles from './ListToolbar.module.css';

/**
 * Search box + filter dropdowns above a list, and the matching in-memory
 * filter. One implementation for every admin and portal list.
 *
 * @param {object}   props
 * @param {string}   [props.searchPlaceholder]
 * @param {string}   props.search           current search text
 * @param {(text: string) => void} [props.onSearch]  omit to hide the box
 * @param {{name, label, options, placeholder?}[]} [props.filters]
 * @param {object}   props.values           { [filter.name]: value }
 * @param {(name, value) => void} props.onFilter
 * @param {string}   [props.summary]        e.g. "12 of 40"
 */
export default function ListToolbar({
  searchPlaceholder = 'Search…',
  search = '',
  onSearch,
  filters = [],
  values = {},
  onFilter,
  summary,
}) {
  const active = Boolean(search) || filters.some((filter) => values[filter.name]);
  if (!onSearch && filters.length === 0) return null;

  return (
    <div className={styles.bar}>
      {onSearch ? (
        <Input
          id="list-search"
          type="search"
          label="Search"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className={styles.search}
        />
      ) : null}

      {filters.map((filter) => (
        <Select
          key={filter.name}
          id={`filter-${filter.name}`}
          label={filter.label}
          placeholder={filter.placeholder ?? `All`}
          options={filter.options ?? []}
          value={values[filter.name] ?? ''}
          onChange={(e) => onFilter(filter.name, e.target.value)}
          className={styles.filter}
        />
      ))}

      <div className={styles.side}>
        {summary ? <span className={styles.summary}>{summary}</span> : null}
        {active ? (
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              onSearch?.('');
              filters.forEach((filter) => onFilter(filter.name, ''));
            }}
          >
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Applies the toolbar's state to a list of rows.
 *
 * @param {object[]} rows
 * @param {{search, searchKeys, filters, values}} state
 *   searchKeys — row fields the search text is matched against (case-insensitive)
 *   filters    — the toolbar's filter definitions; a filter may carry
 *                `match(row, value)` for anything other than "row[name] === value"
 */
export function applyListFilters(rows, { search = '', searchKeys = [], filters = [], values = {} }) {
  const needle = search.trim().toLowerCase();
  return rows.filter((row) => {
    if (needle && !searchKeys.some((key) => String(row[key] ?? '').toLowerCase().includes(needle))) {
      return false;
    }
    return filters.every((filter) => {
      const value = values[filter.name];
      if (!value) return true;
      return filter.match ? filter.match(row, value) : String(row[filter.name] ?? '') === value;
    });
  });
}

/** Filter options for a yes/no field such as isPublished. */
export const booleanFilter = (name, label, yes = 'Yes', no = 'No') => ({
  name,
  label,
  options: [
    { value: 'true', label: yes },
    { value: 'false', label: no },
  ],
  match: (row, value) => String(Boolean(row[name])) === value,
});
