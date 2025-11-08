'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function LaunchPage() {
  const { userId, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div>
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div>
      <h1>Launch</h1>
      <p>User ID: {userId}</p>
    </div>
  );
}
