'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { portalApi } from '@/lib/adminApi';
import { API_ENABLED } from '@/lib/api';
import { clearSession, getStoredUser, setAccessToken, setStoredUser } from '@/lib/auth';

const AuthContext = createContext(null);

/**
 * Wraps one portal (admin panel or teacher portal) and holds its signed-in user.
 *
 * `portal` picks the API prefix — /admin/auth/* or /teacher/auth/* — which are
 * separate accounts on the server (User vs Faculty), so the two providers are
 * never nested and a session belongs to exactly one of them.
 */
export function AuthProvider({ children, portal = 'admin' }) {
  const router = useRouter();
  const api = useMemo(() => portalApi(portal), [portal]);
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

    api
      .get(`/${portal}/auth/me`)
      .then((me) => {
        setUser(me);
        setStoredUser(me);
      })
      .catch(() => {
        clearSession();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [api, portal]);

  const login = useCallback(
    async (email, password) => {
      const result = await api.post(`/${portal}/auth/login`, { email, password });
      setAccessToken(result.accessToken);
      setStoredUser(result.user);
      setUser(result.user);
      return result.user;
    },
    [api, portal]
  );

  const logout = useCallback(async () => {
    try {
      await api.post(`/${portal}/auth/logout`);
    } catch {
      // signing out locally matters more than the server acknowledging it
    }
    clearSession();
    setUser(null);
    router.replace(`/${portal}/login`);
  }, [api, portal, router]);

  const value = useMemo(
    () => ({ portal, user, loading, login, logout, isAuthenticated: Boolean(user) }),
    [portal, user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}

export default AuthProvider;
