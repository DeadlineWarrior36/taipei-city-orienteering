'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { AuthContextType, TPBridgeMessage } from '@/types/auth';
import { apiClient } from '@/lib/api-client';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId && !isAuthenticating && !showLoginModal) {
      handleAutoLogin();
    }
  }, [userId, isAuthenticating, showLoginModal]);

  const handleAutoLogin = async () => {
    setIsAuthenticating(true);
    try {
      await login();
      setLoginError(null);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : '驗證失敗');
      setShowLoginModal(true);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const login = async () => {
    return new Promise<void>((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Window not available'));
        return;
      }

      const performLogin = async (userId: string) => {
        try {
          const data = await apiClient.login({ id: userId });

          setUserId(userId);
          setToken(data.token);
          apiClient.setToken(data.token);
          apiClient.setUserId(userId);
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('user_id', userId);

          resolve();
        } catch (error) {
          console.error('Login error:', error);
          reject(error);
        }
      };

      if (!window.flutterObject) {
        performLogin('test-in-web');
        return;
      }

      window.flutterObject.onmessage = (event: MessageEvent) => {
        try {
          let reply: TPBridgeMessage = event.data;

          if (typeof reply === 'string') {
            reply = JSON.parse(reply) as TPBridgeMessage;
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
    apiClient.setToken(null);
    apiClient.setUserId(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
  };

  if (isAuthenticating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">驗證中...</h1>
          <p className="text-gray-600">正在進行身份驗證</p>
        </div>
      </div>
    );
  }

  if (showLoginModal) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-red-600">需要登入</h2>
          <p className="text-gray-700 mb-4">
            無法自動登入，請手動觸發登入以繼續使用應用。
          </p>
          {loginError && (
            <p className="text-sm text-red-500 mb-4">錯誤：{loginError}</p>
          )}
          <button
            onClick={async () => {
              setShowLoginModal(false);
              setIsAuthenticating(true);
              setLoginError(null);
              try {
                await login();
              } catch (err) {
                setLoginError(err instanceof Error ? err.message : '驗證失敗');
                setShowLoginModal(true);
              } finally {
                setIsAuthenticating(false);
              }
            }}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            點擊登入
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ userId, token, login, logout }}>
      {userId ? children : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600">載入中...</p>
          </div>
        </div>
      )}
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
