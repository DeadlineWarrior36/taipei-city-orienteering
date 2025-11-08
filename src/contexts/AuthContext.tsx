'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TPBridge {
  onmessage: (event: MessageEvent) => void;
  postMessage: (
    action: string,
    data: unknown
  ) => void;
}

declare global {
  interface Window {
    flutterObject?: TPBridge;
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
      if (typeof window === 'undefined') {
        reject(new Error('Window not available'));
        return;
      }

      const performLogin = async (userId: string) => {
        try {
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

          resolve();
        } catch (error) {
          console.error('Login error:', error);
          reject(error);
        }
      };

      if (!window.flutterObject) {
        reject(new Error('TPBridge not available'));
        return;
      }

      window.flutterObject.onmessage = (event: MessageEvent) => {
        try {
          let reply = event.data;

          if (typeof reply === 'string') {
            reply = JSON.parse(reply);
          }

          if (reply.name === 'userinfo') {
            const userInfo = reply.data;
            const userId = (userInfo.cityInternetUid && userInfo.cityInternetUid.trim() !== '')
              ? userInfo.cityInternetUid
              : userInfo.id;

            if (userId) {
              performLogin(userId);
            } else {
              reject(new Error('No user ID found'));
            }
          }
        } catch (e) {
          reject(e);
        }
      };

      window.flutterObject.postMessage(
        JSON.stringify({ name: 'userinfo', data: null }),
        '*'
      );
    });
  };

  const logout = () => {
    setUserId(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
  };

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
