'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LoginCredentials, RegisterCredentials, GuestCheckoutData } from '@/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode?: 'login' | 'register' | 'guest';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  mode = 'login'
}) => {
  const { login, register, loginAsGuest, isLoading, error, clearError } = useAuth();
  const { t, isRTL } = useLanguage();
  const [currentMode, setCurrentMode] = useState<'login' | 'register' | 'guest' | 'forgot-password' | 'reset-sent'>(mode);

  const [loginForm, setLoginForm] = useState<LoginCredentials>({
    email: '',
    password: ''
  });

  const [registerForm, setRegisterForm] = useState<RegisterCredentials>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [guestForm, setGuestForm] = useState<GuestCheckoutData>({
    email: '',
    firstName: '',
    lastName: '',
    phone: ''
  });

  const [forgotPasswordForm, setForgotPasswordForm] = useState({
    email: ''
  });

  const [isResetting, setIsResetting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // Password strength calculation
  const calculatePasswordStrength = (password: string): number => {
    let score = 0;
    if (password.length >= 8) score += 25;
    if (/[a-z]/.test(password)) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[0-9]/.test(password)) score += 25;
    if (/[^A-Za-z0-9]/.test(password)) score += 25;
    return Math.min(score, 100);
  };

  // Update current mode when mode prop changes
  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  // Update password strength when password changes
  useEffect(() => {
    if (registerForm.password) {
      setPasswordStrength(calculatePasswordStrength(registerForm.password));
    } else {
      setPasswordStrength(0);
    }
  }, [registerForm.password]);

  // Form validation
  const validateForm = (mode: string) => {
    const errors: {[key: string]: string} = {};
    
    if (mode === 'register') {
      if (registerForm.password !== registerForm.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
      if (registerForm.password.length < 8) {
        errors.password = 'Password must be at least 8 characters long';
      }
    }
    
    if (mode === 'guest') {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(guestForm.phone)) {
        errors.phone = 'Please enter a valid phone number';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength < 25) return 'bg-red-500';
    if (strength < 50) return 'bg-yellow-500';
    if (strength < 75) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength < 25) return 'Weak';
    if (strength < 50) return 'Fair';
    if (strength < 75) return 'Good';
    return 'Strong';
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const result = await login(loginForm);
    if (result.success) {
      // Only call onSuccess if login was successful
      onSuccess();
    }
    // If login failed, error is already set in context and will be displayed
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await register(registerForm);
      // If we reach here, registration was successful and user is auto-logged in
      onSuccess();
    } catch (error) {
      // Error is handled by the context and will be displayed
      // Don't call onSuccess() - let the user see the error and try again
    }
  };

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    loginAsGuest(guestForm);
    onSuccess();
  };

  const handleForgotPassword = () => {
    setCurrentMode('forgot-password');
    setForgotPasswordForm({ email: loginForm.email }); // Pre-fill with login email if available
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);
    clearError();
    
    // Simulate API call
    setTimeout(() => {
      setIsResetting(false);
      setCurrentMode('reset-sent');
    }, 1500);
  };

  const handleBackToLogin = () => {
    setCurrentMode('login');
    setForgotPasswordForm({ email: '' });
  };

  const resetForms = () => {
    setLoginForm({ email: '', password: '' });
    setRegisterForm({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
    setGuestForm({ email: '', firstName: '', lastName: '', phone: '' });
    clearError();
  };

  const handleClose = () => {
    resetForms();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Clean Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity duration-200"
        onClick={handleClose} 
      />
      
      {/* Clean Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[95vh] overflow-y-auto">
          {/* Premium Header */}
          <div className={`relative flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50/50 via-white to-pink-50/50 backdrop-blur-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-t-2xl" />
            </div>
            
            <div className={`relative flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
              {/* Premium Icon */}
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
                  {currentMode === 'login' && (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  )}
                  {currentMode === 'register' && (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  )}
                  {currentMode === 'guest' && (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                  {currentMode === 'forgot-password' && (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2 2 2 0 01-2 2 2 2 0 01-2-2m0-4a4 4 0 00-8 0v2m0 6V9a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    </svg>
                  )}
                  {currentMode === 'reset-sent' && (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                {/* Icon glow effect */}
                <div className="absolute inset-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 blur-xl opacity-30 -z-10 animate-pulse" />
              </div>
              
              {/* Premium Title */}
              <div className="flex flex-col">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 bg-clip-text text-transparent">
                  {currentMode === 'login' && t('auth.signIn')}
                  {currentMode === 'register' && t('auth.signUp')}
                  {currentMode === 'guest' && t('auth.guestCheckout')}
                  {currentMode === 'forgot-password' && 'Reset Password'}
                  {currentMode === 'reset-sent' && 'Check Your Email'}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {currentMode === 'login' && 'Welcome back! Please sign in to your account'}
                  {currentMode === 'register' && 'Create your account to get started'}
                  {currentMode === 'guest' && 'Quick checkout without an account'}
                  {currentMode === 'forgot-password' && 'We\'ll send you a reset link'}
                  {currentMode === 'reset-sent' && 'Password reset link has been sent'}
                </p>
              </div>
            </div>
            
            {/* Premium Close Button */}
            <button
              onClick={handleClose}
              className="relative w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-gradient-to-br hover:from-red-400 hover:to-red-500 transition-all duration-300 transform hover:scale-110 group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl opacity-0 group-hover:opacity-0 transition-opacity" />
              <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-xl bg-red-400 blur-lg opacity-0 group-hover:opacity-30 transition-opacity -z-10" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Clean Tab Navigation */}
            {(currentMode === 'login' || currentMode === 'register' || currentMode === 'guest') && (
              <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                <button
                  onClick={() => setCurrentMode('login')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                    currentMode === 'login'
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {t('auth.signIn')}
                </button>
                
                <button
                  onClick={() => setCurrentMode('register')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                    currentMode === 'register'
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {t('auth.signUp')}
                </button>
                
                <button
                  onClick={() => setCurrentMode('guest')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                    currentMode === 'guest'
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {t('auth.guest')}
                </button>
              </div>
            )}

            {/* Enhanced Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/50 rounded-xl text-red-700 text-sm shadow-sm backdrop-blur-sm animate-in slide-in-from-top duration-300">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Premium Login Form */}
            {currentMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-6 animate-in slide-in-from-right duration-300">
                <div className="relative group">
                  <label className="block text-sm font-semibold bg-gradient-to-r from-gray-700 to-gray-800 bg-clip-text text-transparent mb-3">
                    {t('auth.email')}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 pl-12 bg-white/50 backdrop-blur-sm border border-gray-200/60 rounded-xl focus:ring-2 focus:ring-purple-500/40 focus:border-purple-300 transition-all duration-300 text-gray-800 placeholder-gray-400 shadow-sm hover:shadow-md group-hover:border-purple-200"
                      placeholder="Enter your email"
                      required
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="relative group">
                  <label className="block text-sm font-semibold bg-gradient-to-r from-gray-700 to-gray-800 bg-clip-text text-transparent mb-3">
                    {t('auth.password')}
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full px-4 py-3 pl-12 bg-white/50 backdrop-blur-sm border border-gray-200/60 rounded-xl focus:ring-2 focus:ring-purple-500/40 focus:border-purple-300 transition-all duration-300 text-gray-800 placeholder-gray-400 shadow-sm hover:shadow-md group-hover:border-purple-200"
                      placeholder="Enter your password"
                      required
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Enhanced Forgot Password Link */}
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => handleForgotPassword()}
                    className="text-sm font-medium text-purple-600 hover:text-purple-700 hover:underline transition-all duration-200 transform hover:scale-105"
                  >
                    {t('auth.forgotPassword')}
                  </button>
                </div>

                {/* Premium Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full relative overflow-hidden px-6 py-4 bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-xl group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <div className="relative flex items-center justify-center space-x-2">
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>{t('common.loading')}</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        <span>{t('auth.signIn')}</span>
                      </>
                    )}
                  </div>
                </button>
              </form>
            )}

            {/* Register Form */}
            {currentMode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-6 animate-in slide-in-from-right duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative group">
                    <label className="block text-sm font-semibold bg-gradient-to-r from-gray-700 to-gray-800 bg-clip-text text-transparent mb-3">
                      {t('checkout.firstName')}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={registerForm.firstName}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full px-4 py-3 pl-12 bg-white/50 backdrop-blur-sm border border-gray-200/60 rounded-xl focus:ring-2 focus:ring-purple-500/40 focus:border-purple-300 transition-all duration-300 text-gray-800 placeholder-gray-400 shadow-sm hover:shadow-md group-hover:border-purple-200"
                        placeholder="First name"
                        required
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="relative group">
                    <label className="block text-sm font-semibold bg-gradient-to-r from-gray-700 to-gray-800 bg-clip-text text-transparent mb-3">
                      {t('checkout.lastName')}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={registerForm.lastName}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full px-4 py-3 pl-12 bg-white/50 backdrop-blur-sm border border-gray-200/60 rounded-xl focus:ring-2 focus:ring-purple-500/40 focus:border-purple-300 transition-all duration-300 text-gray-800 placeholder-gray-400 shadow-sm hover:shadow-md group-hover:border-purple-200"
                        placeholder="Last name"
                        required
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-sm font-semibold bg-gradient-to-r from-gray-700 to-gray-800 bg-clip-text text-transparent mb-3">
                    {t('auth.email')}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 pl-12 bg-white/50 backdrop-blur-sm border border-gray-200/60 rounded-xl focus:ring-2 focus:ring-purple-500/40 focus:border-purple-300 transition-all duration-300 text-gray-800 placeholder-gray-400 shadow-sm hover:shadow-md group-hover:border-purple-200"
                      placeholder="Enter your email"
                      required
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="relative group">
                  <label className="block text-sm font-semibold bg-gradient-to-r from-gray-700 to-gray-800 bg-clip-text text-transparent mb-3">
                    {t('auth.password')}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                      className={`w-full px-4 py-3 pl-12 pr-12 bg-white/50 backdrop-blur-sm border rounded-xl focus:ring-2 focus:ring-purple-500/40 focus:border-purple-300 transition-all duration-300 text-gray-800 placeholder-gray-400 shadow-sm hover:shadow-md group-hover:border-purple-200 ${
                        formErrors.password ? 'border-red-300/60' : 'border-gray-200/60'
                      }`}
                      placeholder="Enter your password"
                      required
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-purple-500 transition-colors"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.76 6.76M14.121 14.121l3.116 3.116M14.121 14.121L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {/* Password Strength Indicator */}
                  {registerForm.password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Password Strength</span>
                        <span className={`text-xs font-medium ${
                          passwordStrength < 25 ? 'text-red-600' :
                          passwordStrength < 50 ? 'text-yellow-600' :
                          passwordStrength < 75 ? 'text-blue-600' : 'text-green-600'
                        }`}>
                          {getPasswordStrengthText(passwordStrength)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
                          style={{ width: `${passwordStrength}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {formErrors.password && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                  )}
                </div>

                <div className="relative group">
                  <label className="block text-sm font-semibold bg-gradient-to-r from-gray-700 to-gray-800 bg-clip-text text-transparent mb-3">
                    {t('auth.confirmPassword')}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={registerForm.confirmPassword}
                      onChange={(e) => {
                        setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }));
                        // Clear error when user starts typing
                        if (formErrors.confirmPassword) {
                          setFormErrors(prev => ({ ...prev, confirmPassword: '' }));
                        }
                      }}
                      className={`w-full px-4 py-3 pl-12 pr-12 bg-white/50 backdrop-blur-sm border rounded-xl focus:ring-2 focus:ring-purple-500/40 focus:border-purple-300 transition-all duration-300 text-gray-800 placeholder-gray-400 shadow-sm hover:shadow-md group-hover:border-purple-200 ${
                        formErrors.confirmPassword ? 'border-red-300/60' : 'border-gray-200/60'
                      }`}
                      placeholder="Confirm your password"
                      required
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-purple-500 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.76 6.76M14.121 14.121l3.116 3.116M14.121 14.121L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {formErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
                  )}
                  {/* Password Match Indicator */}
                  {registerForm.confirmPassword && (
                    <div className="mt-1 flex items-center">
                      {registerForm.password === registerForm.confirmPassword ? (
                        <div className="flex items-center text-green-600 text-xs">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Passwords match
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600 text-xs">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          Passwords don't match
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Premium Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full relative overflow-hidden px-6 py-4 bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-xl group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <div className="relative flex items-center justify-center space-x-2">
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>{t('common.loading')}</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        <span>{t('auth.signUp')}</span>
                      </>
                    )}
                  </div>
                </button>
              </form>
            )}

            {/* Guest Form */}
            {currentMode === 'guest' && (
              <form onSubmit={handleGuestSubmit} className="space-y-6 animate-in slide-in-from-right duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative group">
                    <label className="block text-sm font-semibold bg-gradient-to-r from-gray-700 to-gray-800 bg-clip-text text-transparent mb-3">
                      {t('checkout.firstName')}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={guestForm.firstName}
                        onChange={(e) => setGuestForm(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full px-4 py-3 pl-12 bg-white/50 backdrop-blur-sm border border-gray-200/60 rounded-xl focus:ring-2 focus:ring-purple-500/40 focus:border-purple-300 transition-all duration-300 text-gray-800 placeholder-gray-400 shadow-sm hover:shadow-md group-hover:border-purple-200"
                        placeholder="First name"
                        required
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="relative group">
                    <label className="block text-sm font-semibold bg-gradient-to-r from-gray-700 to-gray-800 bg-clip-text text-transparent mb-3">
                      {t('checkout.lastName')}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={guestForm.lastName}
                        onChange={(e) => setGuestForm(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full px-4 py-3 pl-12 bg-white/50 backdrop-blur-sm border border-gray-200/60 rounded-xl focus:ring-2 focus:ring-purple-500/40 focus:border-purple-300 transition-all duration-300 text-gray-800 placeholder-gray-400 shadow-sm hover:shadow-md group-hover:border-purple-200"
                        placeholder="Last name"
                        required
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-sm font-semibold bg-gradient-to-r from-gray-700 to-gray-800 bg-clip-text text-transparent mb-3">
                    {t('auth.email')}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={guestForm.email}
                      onChange={(e) => setGuestForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 pl-12 bg-white/50 backdrop-blur-sm border border-gray-200/60 rounded-xl focus:ring-2 focus:ring-purple-500/40 focus:border-purple-300 transition-all duration-300 text-gray-800 placeholder-gray-400 shadow-sm hover:shadow-md group-hover:border-purple-200"
                      placeholder="Enter your email"
                      required
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-sm font-semibold bg-gradient-to-r from-gray-700 to-gray-800 bg-clip-text text-transparent mb-3">
                    {t('checkout.phone')}
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={guestForm.phone}
                      onChange={(e) => {
                        setGuestForm(prev => ({ ...prev, phone: e.target.value }));
                        // Clear error when user starts typing
                        if (formErrors.phone) {
                          setFormErrors(prev => ({ ...prev, phone: '' }));
                        }
                      }}
                      className={`w-full px-4 py-3 pl-12 bg-white/50 backdrop-blur-sm border rounded-xl focus:ring-2 focus:ring-purple-500/40 focus:border-purple-300 transition-all duration-300 text-gray-800 placeholder-gray-400 shadow-sm hover:shadow-md group-hover:border-purple-200 ${
                        formErrors.phone ? 'border-red-300/60' : 'border-gray-200/60'
                      }`}
                      placeholder="+1234567890"
                      required
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                  </div>
                  {formErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                  )}
                </div>

                {/* Premium Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full relative overflow-hidden px-6 py-4 bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-xl group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <div className="relative flex items-center justify-center space-x-2">
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>{t('common.loading')}</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>{t('auth.continueAsGuest')}</span>
                      </>
                    )}
                  </div>
                </button>
              </form>
            )}

            {/* Forgot Password Form */}
            {currentMode === 'forgot-password' && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {t('auth.forgotPasswordTitle')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t('auth.forgotPasswordDesc')}
                  </p>
                </div>

                <form onSubmit={handleForgotPasswordSubmit} className="space-y-6 animate-in slide-in-from-right duration-300">
                  <div className="relative group">
                    <label className="block text-sm font-semibold bg-gradient-to-r from-gray-700 to-gray-800 bg-clip-text text-transparent mb-3">
                      {t('auth.email')}
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={forgotPasswordForm.email}
                        onChange={(e) => setForgotPasswordForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-3 pl-12 bg-white/50 backdrop-blur-sm border border-gray-200/60 rounded-xl focus:ring-2 focus:ring-purple-500/40 focus:border-purple-300 transition-all duration-300 text-gray-800 placeholder-gray-400 shadow-sm hover:shadow-md group-hover:border-purple-200"
                        placeholder="your@email.com"
                        required
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Premium Submit Button */}
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="w-full relative overflow-hidden px-6 py-4 bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-xl group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <div className="relative flex items-center justify-center space-x-2">
                      {isResetting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>{t('common.loading')}</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span>{t('auth.sendResetLink')}</span>
                        </>
                      )}
                    </div>
                  </button>
                </form>

                <div className="text-center mt-4">
                  <button
                    onClick={handleBackToLogin}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    {t('auth.backToLogin')}
                  </button>
                </div>
              </div>
            )}

            {/* Reset Link Sent Confirmation */}
            {currentMode === 'reset-sent' && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {t('auth.resetLinkSent')}
                </h3>
                
                <p className="text-sm text-gray-600 mb-6">
                  {t('auth.resetLinkSentDesc')}
                </p>

                <div className="space-y-3">
                  {/* Premium Back to Login Button */}
                  <button
                    onClick={handleBackToLogin}
                    className="w-full relative overflow-hidden px-6 py-4 bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <div className="relative flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span>{t('auth.backToLogin')}</span>
                    </div>
                  </button>
                  
                  {/* Premium Cancel Button */}
                  <button
                    onClick={handleClose}
                    className="w-full relative overflow-hidden px-6 py-4 bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 text-white font-semibold rounded-xl hover:from-gray-500 hover:via-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <div className="relative flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>{t('common.cancel')}</span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Alternative Options */}
            <div className="mt-6 text-center text-sm text-gray-600">
              {currentMode === 'login' && (
                <>
                  <p>{t('auth.noAccount')} 
                    <button 
                      type="button"
                      onClick={() => setCurrentMode('register')}
                      className="text-purple-600 hover:text-purple-700 font-medium ml-1 transition-colors"
                    >
                      {t('auth.signUp')}
                    </button>
                  </p>
                  <p className="mt-2">{t('auth.orContinueAs')} 
                    <button 
                      type="button"
                      onClick={() => setCurrentMode('guest')}
                      className="text-purple-600 hover:text-purple-700 font-medium ml-1 transition-colors"
                    >
                      {t('auth.guest')}
                    </button>
                  </p>
                </>
              )}
              {currentMode === 'register' && (
                <>
                  <p>{t('auth.haveAccount')} 
                    <button 
                      type="button"
                      onClick={() => setCurrentMode('login')}
                      className="text-purple-600 hover:text-purple-700 font-medium ml-1 transition-colors"
                    >
                      {t('auth.signIn')}
                    </button>
                  </p>
                  <p className="mt-2">{t('auth.orContinueAs')} 
                    <button 
                      type="button"
                      onClick={() => setCurrentMode('guest')}
                      className="text-purple-600 hover:text-purple-700 font-medium ml-1 transition-colors"
                    >
                      {t('auth.guest')}
                    </button>
                  </p>
                </>
              )}
              {currentMode === 'guest' && (
                <>
                  <p>{t('auth.haveAccount')} 
                    <button 
                      type="button"
                      onClick={() => setCurrentMode('login')}
                      className="text-purple-600 hover:text-purple-700 font-medium ml-1 transition-colors"
                    >
                      {t('auth.signIn')}
                    </button>
                  </p>
                  <p className="mt-2">{t('auth.orCreateAccount')} 
                    <button 
                      type="button"
                      onClick={() => setCurrentMode('register')}
                      className="text-purple-600 hover:text-purple-700 font-medium ml-1 transition-colors"
                    >
                      {t('auth.signUp')}
                    </button>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
