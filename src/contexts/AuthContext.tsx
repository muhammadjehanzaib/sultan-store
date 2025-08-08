"use client";

import React, { createContext, useContext, useState } from 'react';
import { useSession, signIn, signOut, getSession } from 'next-auth/react';
import { User, AuthState, LoginCredentials, RegisterCredentials, GuestCheckoutData } from '@/types';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  loginAsGuest: (guestData: GuestCheckoutData) => void;
  updateUser: (updatedUser: Partial<User>) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [guestUser, setGuestUser] = useState<User | null>(null);

  // Load guest user from localStorage on mount
  React.useEffect(() => {
    const savedGuestUser = localStorage.getItem('guest-user');
    if (savedGuestUser) {
      try {
        setGuestUser(JSON.parse(savedGuestUser));
      } catch (error) {
        console.error('Error parsing guest user from localStorage:', error);
        localStorage.removeItem('guest-user');
      }
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setError(null);
    const result = await signIn('credentials', {
      ...credentials,
      redirect: false,
    });
    if (result?.error) {
      setError(result.error);
      return { success: false, error: result.error };
    }
    if (!result?.ok) {
      const errorMessage = 'Login failed. Please check your credentials.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
    // Clear guest user data when user logs in normally
    localStorage.removeItem('guest-user');
    setGuestUser(null);
    return { success: true };
  };

  const register = async (credentials: RegisterCredentials) => {
    setError(null);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await response.json();
      if (!response.ok) {
        const errorMessage = data.error || 'Registration failed';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
      // Auto-login after successful registration
      await login({ email: credentials.email, password: credentials.password });
    } catch (err: any) {
      setError(err.message);
      throw err; // Re-throw the error so the calling code can catch it
    }
  };

  const loginAsGuest = (guestData: GuestCheckoutData) => {
    // For guest checkout, we can store in localStorage temporarily
    const newGuestUser: User = {
      id: `guest-${Date.now()}`,
      email: guestData.email,
      name: `${guestData.firstName} ${guestData.lastName}`,
      firstName: guestData.firstName,
      lastName: guestData.lastName,
      phone: guestData.phone,
      isGuest: true,
      createdAt: new Date(),
      role: 'viewer',
    };
    localStorage.setItem('guest-user', JSON.stringify(newGuestUser));
    setGuestUser(newGuestUser);
  };

  const logout = () => {
    localStorage.removeItem('guest-user');
    setGuestUser(null);
    signOut();
  };

  const updateUser = async (updatedUser: Partial<User>) => {
    if (guestUser) {
      // Update guest user
      const updated = { ...guestUser, ...updatedUser };
      setGuestUser(updated);
      localStorage.setItem('guest-user', JSON.stringify(updated));
    }
    // For session users, we need to trigger a session update
    // The session will be refreshed and updated with new data from the database
    if (session?.user) {
      // Refresh the session to get updated user data
      await getSession();
      window.location.reload(); // Temporary solution to ensure UI updates
    }
  };

  const clearError = () => setError(null);

  // Determine the current user (session user takes priority over guest user)
  const currentUser = session?.user as User || guestUser;
  const isAuthenticated = !!(session?.user || guestUser);

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        isAuthenticated,
        isLoading: status === 'loading',
        error,
        login,
        register,
        logout,
        loginAsGuest,
        updateUser,
        clearError,
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
