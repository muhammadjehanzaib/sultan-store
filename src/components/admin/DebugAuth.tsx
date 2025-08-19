'use client';

import { useSession } from 'next-auth/react';

export function DebugAuth() {
  const { data: session, status } = useSession();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <h3 className="text-sm font-medium text-yellow-800 mb-2">Debug: Authentication Status</h3>
      <div className="text-xs text-yellow-700 space-y-1">
        <div>Status: {status}</div>
        <div>User: {session?.user?.email || 'Not logged in'}</div>
        <div>Role: {session?.user?.role || 'No role'}</div>
        <div>Session ID: {session?.user?.id || 'No ID'}</div>
      </div>
    </div>
  );
}
