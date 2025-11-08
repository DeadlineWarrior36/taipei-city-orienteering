'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export default function LaunchPage() {
  const { login } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const authenticate = async () => {
      try {
        await login();
        if (mounted) {
          setIsAuthenticating(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Authentication failed');
          setIsAuthenticating(false);
        }
      }
    };

    authenticate();

    return () => {
      mounted = false;
    };
  }, []);

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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2 text-red-600">驗證失敗</h1>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            重新嘗試
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Launch</h1>
      <p>驗證成功，準備啟動應用</p>
    </div>
  );
}
