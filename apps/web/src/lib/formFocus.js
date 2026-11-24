/**
 * After client-side validation, move keyboard focus to the first invalid
 * control and place it safely below the sticky header.
 */
export function focusFirstInvalidField(form, errors, fieldIds = {}) {
  const firstError = Object.keys(errors)[0];
  if (!form || !firstError) return;

  const field = document.getElementById(fieldIds[firstError] || firstError);
  if (!field || !form.contains(field)) return;

  requestAnimationFrame(() => {
    field.focus({ preventScroll: true });
    const scrollTarget = field.closest('[data-error-field]') || field;
    scrollTarget.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'center',
    });
  });
}
