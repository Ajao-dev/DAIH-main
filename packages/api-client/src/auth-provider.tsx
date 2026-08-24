'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserProfile } from '@daih/types';
import { api, DaihApiClient } from './client';

interface AuthContextType {
  user: UserProfile | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: {
    email: string;
    password: string;
    portal?: 'customer' | 'admin' | string;
    audience?: 'CUSTOMER' | 'ADMIN' | string;
  }) => Promise<UserProfile>;
  register: (payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    policyVersion?: string;
    consented: boolean;
  }) => Promise<{ user: UserProfile; verificationSent: boolean }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  apiClient = api,
}: {
  children: React.ReactNode;
  apiClient?: DaihApiClient;
}) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('daih_user_profile');
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return null;
  });
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const inFlightRefreshRef = React.useRef<Promise<UserProfile | null> | null>(null);

  const updateUserState = useCallback((newUser: UserProfile | null) => {
    setUser(newUser);
    if (typeof window !== 'undefined') {
      try {
        if (newUser) {
          localStorage.setItem('daih_user_profile', JSON.stringify(newUser));
        } else {
          localStorage.removeItem('daih_user_profile');
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    apiClient.setOnSessionExpired(() => {
      updateUserState(null);
      setAccessToken(null);
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    });
  }, [apiClient, updateUserState]);

  const refreshSession = useCallback(async (): Promise<UserProfile | null> => {
    if (inFlightRefreshRef.current) {
      return inFlightRefreshRef.current;
    }

    const promise = (async () => {
      try {
        const res = await apiClient.auth.refresh();
        updateUserState(res.user);
        const token = res.accessToken || (res as any).token || null;
        setAccessToken(token);
        return res.user;
      } catch {
        // If refresh cookie failed, check if we have a valid stored token & fetch profile
        try {
          const storedToken = await apiClient.getAccessToken();
          if (storedToken) {
            const profile = await apiClient.auth.getProfile();
            updateUserState(profile);
            setAccessToken(storedToken);
            return profile;
          }
        } catch {
          // Stored token is invalid or expired
        }

        updateUserState(null);
        setAccessToken(null);
        return null;
      } finally {
        inFlightRefreshRef.current = null;
      }
    })();

    inFlightRefreshRef.current = promise;
    return promise;
  }, [apiClient, updateUserState]);

  // Initial session restoration on load
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await refreshSession();
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [refreshSession]);

  const login = async (credentials: {
    email: string;
    password: string;
    portal?: 'customer' | 'admin' | string;
    audience?: 'CUSTOMER' | 'ADMIN' | string;
  }): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const res = await apiClient.auth.login(credentials);
      updateUserState(res.user);
      const token = res.accessToken || (res as any).token || null;
      setAccessToken(token);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    policyVersion?: string;
    consented: boolean;
  }) => {
    setIsLoading(true);
    try {
      return await apiClient.auth.register(payload);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiClient.auth.logout();
    } finally {
      updateUserState(null);
      setAccessToken(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
