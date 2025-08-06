'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function TestAuth() {
  const { data: session, status } = useSession();
  const [credentials, setCredentials] = useState({
    email: 'admin@example.com',
    password: 'admin123'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const result = await signIn('credentials', {
      email: credentials.email,
      password: credentials.password,
      redirect: false
    });
    
    setIsLoading(false);
    
    if (result && result.error) {
      setError(result.error);
    }
  };

  if (status === 'loading') {
    return <div className="p-8">Loading...</div>;
  }

  // Force show form if there's an error, regardless of session
  const shouldShowForm = !session || error;

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">NextAuth Test</h1>
        
        {/* Debug info */}
        <div className="mb-4 p-2 bg-gray-100 text-xs">
          <p>Session: {session ? 'Yes' : 'No'}</p>
          <p>Status: {status}</p>
          <p>Error: {error || 'None'}</p>
        </div>
        
        {session && !error ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-green-800 mb-2">Signed in as:</h2>
              <p className="text-green-700">Email: {session.user?.email}</p>
              <p className="text-green-700">Name: {session.user?.name}</p>
              <p className="text-green-700">Role: {session.user?.role}</p>
              <p className="text-green-700">ID: {session.user?.id}</p>
              <div className="mt-4">
                <a 
                  href="/admin" 
                  className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Try Admin Panel Access
                </a>
              </div>
            </div>
            
            <button
              onClick={() => signOut()}
              className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <form onSubmit={handleSignIn} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                required
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                required
                disabled={isLoading}
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
            
            <div className="text-sm text-gray-600 mt-4">
              <p>Test credentials:</p>
              <p>Admin: admin@example.com / admin123</p>
              <p>User: user@example.com / user123</p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
