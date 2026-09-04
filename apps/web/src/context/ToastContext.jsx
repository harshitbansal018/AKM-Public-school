'use client';

import { createContext, useCallback, useMemo, useState } from 'react';
import ToastStack from '@/components/ui/Toast/Toast';

export const ToastContext = createContext(null);

let nextId = 0;

/**
 * Provides transient notifications to the whole app.
 * Mounted once in the root layout; consumed via the useToast() hook.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (message, { tone = 'info', duration = 5000 } = {}) => {
      const id = (nextId += 1);
      setToasts((current) => [...current, { id, message, tone }]);
      if (duration > 0) setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      push,
      dismiss,
      success: (message, options) => push(message, { ...options, tone: 'success' }),
      error: (message, options) => push(message, { ...options, tone: 'error' }),
      info: (message, options) => push(message, { ...options, tone: 'info' }),
    }),
    [push, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export default ToastProvider;
