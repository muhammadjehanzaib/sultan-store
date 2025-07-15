"use client";

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, AuthState, LoginCredentials, RegisterCredentials, GuestCheckoutData } from '@/types';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  loginAsGuest: (guestData: GuestCheckoutData) => void;
  clearError: () => void;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const AuthContext = createContext<AuthContextType | null>(null);

function authReducer(state: AuthState, action: any): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_ERROR':
    case 'REGISTER_ERROR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'GUEST_LOGIN':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'LOAD_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const savedUser = localStorage.getItem('ecommerce-user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({ type: 'LOAD_USER', payload: user });
      } catch (error) {
        localStorage.removeItem('ecommerce-user');
      }
    }
  }, []);

  useEffect(() => {
    if (state.user) {
      localStorage.setItem('ecommerce-user', JSON.stringify(state.user));
    } else {
      localStorage.removeItem('ecommerce-user');
    }
  }, [state.user]);

  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      // Mock user data
      const mockUser: User = {
        id: '1',
        email: credentials.email,
        name: credentials.email.split('@')[0],
        firstName: 'Rehan',
        lastName: 'Don',
        phone: '+1234567890',
        isGuest: false,
        createdAt: new Date(),
        role: 'viewer',
      };
      dispatch({ type: 'LOGIN_SUCCESS', payload: mockUser });
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR', payload: 'Invalid email or password' });
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    dispatch({ type: 'REGISTER_START' });
    try {
      if (credentials.password !== credentials.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockUser: User = {
        id: Date.now().toString(),
        email: credentials.email,
        name: `${credentials.firstName} ${credentials.lastName}`,
        firstName: credentials.firstName,
        lastName: credentials.lastName,
        isGuest: false,
        createdAt: new Date(),
        role: 'viewer',
      };
      dispatch({ type: 'REGISTER_SUCCESS', payload: mockUser });
    } catch (error: any) {
      dispatch({ type: 'REGISTER_ERROR', payload: error.message || 'Registration failed' });
    }
  };

  const loginAsGuest = (guestData: GuestCheckoutData) => {
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
    dispatch({ type: 'GUEST_LOGIN', payload: guestUser });
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
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
