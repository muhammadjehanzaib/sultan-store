"use client";

import React, { createContext, useContext, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { User, AuthState, LoginCredentials, RegisterCredentials, GuestCheckoutData } from '@/types';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  loginAsGuest: (guestData: GuestCheckoutData) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);

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
        throw new Error(data.error || 'Registration failed');
      }
      // Auto-login after successful registration
      await login({ email: credentials.email, password: credentials.password });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loginAsGuest = (guestData: GuestCheckoutData) => {
    // For guest checkout, we can store in localStorage temporarily
    const guestUser: User = {
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
    localStorage.setItem('guest-user', JSON.stringify(guestUser));
  };

  const logout = () => {
    localStorage.removeItem('guest-user');
    signOut();
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user: session?.user as User || null,
        isAuthenticated: !!session?.user,
        isLoading: status === 'loading',
        error,
        login,
        register,
        logout,
        loginAsGuest,
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
