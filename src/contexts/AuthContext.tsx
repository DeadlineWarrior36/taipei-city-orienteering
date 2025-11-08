'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TPBridgeUserInfo {
  cityInternetUid?: string;
  id?: string;
}

interface TPBridge {
  postMessage: (
    action: string,
    data: unknown,
    callback: (reply: { data: TPBridgeUserInfo }) => void
  ) => void;
}

declare global {
  interface Window {
    TPBridge?: TPBridge;
  }
}

interface AuthContextType {
  userId: string | null;
  token: string | null;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async () => {
    return new Promise<void>((resolve, reject) => {
      if (typeof window === 'undefined' || !window.TPBridge) {
        setIsLoading(false);
        reject(new Error('TPBridge not available'));
        return;
      }

      window.TPBridge.postMessage('userinfo', null, async (reply) => {
        try {
          const userInfo = reply.data;
          const userId = userInfo.cityInternetUid || userInfo.id;

          if (!userId) {
            throw new Error('No user ID found');
          }

          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: userId }),
          });

          if (!response.ok) {
            throw new Error('Login failed');
          }

          const data = await response.json();

          setUserId(userId);
          setToken(data.token);
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('user_id', userId);

          setIsLoading(false);
          resolve();
        } catch (error) {
          console.error('Login error:', error);
          setIsLoading(false);
          reject(error);
        }
      });
    });
  };

  const logout = () => {
    setUserId(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUserId = localStorage.getItem('user_id');

    if (storedToken && storedUserId) {
      setToken(storedToken);
      setUserId(storedUserId);
      setIsLoading(false);
    } else {
      login().catch(() => {
        setIsLoading(false);
      });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ userId, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
