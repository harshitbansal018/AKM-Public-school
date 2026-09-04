'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/adminApi';
import { API_ENABLED } from '@/lib/api';
import { clearSession, getStoredUser, setAccessToken, setStoredUser } from '@/lib/auth';

const AuthContext = createContext(null);

/** Wraps the admin panel and holds the signed-in user. */
export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the session on mount, then confirm it against the API.
  useEffect(() => {
    const stored = getStoredUser();
    if (stored) setUser(stored);

    if (!API_ENABLED) {
      setLoading(false);
      return;
    }

    adminApi
      .get('/admin/auth/me')
      .then((me) => {
        setUser(me);
        setStoredUser(me);
      })
      .catch(() => {
        clearSession();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const result = await adminApi.post('/admin/auth/login', { email, password });
    setAccessToken(result.accessToken);
    setStoredUser(result.user);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await adminApi.post('/admin/auth/logout');
    } catch {
      // signing out locally matters more than the server acknowledging it
    }
    clearSession();
    setUser(null);
    router.replace('/admin/login');
  }, [router]);

  const value = useMemo(
    () => ({ user, loading, login, logout, isAuthenticated: Boolean(user) }),
    [user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}

export default AuthProvider;
