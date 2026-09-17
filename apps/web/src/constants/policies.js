/**
 * Policies grouped under the Policies page tabs, in the order the office set
 * the tabs. A tab with no active policy is left out; a policy whose tab has
 * since been removed is shown under its own name at the end, never lost.
 */
export function groupPoliciesByTab(policies = [], tabs = []) {
  const known = tabs.map((tab) => ({
    tab,
    items: policies.filter((policy) => policy.category === tab),
  }));
  const orphans = [...new Set(policies.map((p) => p.category).filter((c) => !tabs.includes(c)))].map(
    (tab) => ({ tab, items: policies.filter((policy) => policy.category === tab) })
  );
  return [...known, ...orphans].filter((group) => group.items.length > 0);
}

/** "Attendance / Leave Rules" -> "attendance-leave-rules", for tab ids and hashes. */
export const tabSlug = (tab) =>
  String(tab)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
