/** The review flow for a job application, in order — matches the API. */
export const applicationStatuses = [
  { value: 'NEW', label: 'New', tone: 'NEW' },
  { value: 'UNDER_REVIEW', label: 'Under review', tone: 'CONTACTED' },
  { value: 'SHORTLISTED', label: 'Shortlisted', tone: 'sky' },
  { value: 'INTERVIEW', label: 'Interview', tone: 'sky' },
  { value: 'SELECTED', label: 'Selected', tone: 'active' },
  { value: 'REJECTED', label: 'Rejected', tone: 'inactive' },
];

export const statusLabel = (value) =>
  applicationStatuses.find((status) => status.value === value)?.label ?? value;

export const statusTone = (value) =>
  applicationStatuses.find((status) => status.value === value)?.tone ?? 'sky';
