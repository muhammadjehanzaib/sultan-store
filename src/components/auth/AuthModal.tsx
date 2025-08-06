'use client';

import React, { useState } from 'react';
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
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50 backdrop-blur-sm" onClick={handleClose} />
      
      {/* Modal */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4`}>
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b border-gray-200 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <h2 className="text-xl font-bold text-gray-800">
              {currentMode === 'login' && t('auth.signIn')}
              {currentMode === 'register' && t('auth.signUp')}
              {currentMode === 'guest' && t('auth.guestCheckout')}
            </h2>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-white hover:bg-red-500 transition-all duration-200 text-xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Mode Selection Tabs */}
            <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setCurrentMode('login')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  currentMode === 'login'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {t('auth.signIn')}
              </button>
              <button
                onClick={() => setCurrentMode('register')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  currentMode === 'register'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {t('auth.signUp')}
              </button>
              <button
                onClick={() => setCurrentMode('guest')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  currentMode === 'guest'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {t('auth.guest')}
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Login Form */}
            {currentMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('auth.email')}
                  </label>
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('auth.password')}
                  </label>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                    required
                  />
                </div>

                {/* Forgot Password Link */}
                <div className="text-right mb-4">
                  <button
                    type="button"
                    onClick={() => handleForgotPassword()}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    {t('auth.forgotPassword')}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? t('common.loading') : t('auth.signIn')}
                </button>
              </form>
            )}

            {/* Register Form */}
            {currentMode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('checkout.firstName')}
                    </label>
                    <input
                      type="text"
                      value={registerForm.firstName}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('checkout.lastName')}
                    </label>
                    <input
                      type="text"
                      value={registerForm.lastName}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('auth.email')}
                  </label>
                  <input
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('auth.password')}
                  </label>
                  <input
                    type="password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('auth.confirmPassword')}
                  </label>
                  <input
                    type="password"
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? t('common.loading') : t('auth.signUp')}
                </button>
              </form>
            )}

            {/* Guest Form */}
            {currentMode === 'guest' && (
              <form onSubmit={handleGuestSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('checkout.firstName')}
                    </label>
                    <input
                      type="text"
                      value={guestForm.firstName}
                      onChange={(e) => setGuestForm(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('checkout.lastName')}
                    </label>
                    <input
                      type="text"
                      value={guestForm.lastName}
                      onChange={(e) => setGuestForm(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('auth.email')}
                  </label>
                  <input
                    type="email"
                    value={guestForm.email}
                    onChange={(e) => setGuestForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('checkout.phone')}
                  </label>
                  <input
                    type="tel"
                    value={guestForm.phone}
                    onChange={(e) => setGuestForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? t('common.loading') : t('auth.continueAsGuest')}
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

                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('auth.email')}
                    </label>
                    <input
                      type="email"
                      value={forgotPasswordForm.email}
                      onChange={(e) => setForgotPasswordForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                      required
                      placeholder="your@email.com"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isResetting}
                    className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isResetting ? t('common.loading') : t('auth.sendResetLink')}
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
                  <button
                    onClick={handleBackToLogin}
                    className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    {t('auth.backToLogin')}
                  </button>
                  
                  <button
                    onClick={handleClose}
                    className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    {t('common.cancel')}
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
                      onClick={() => setCurrentMode('register')}
                      className="text-purple-600 hover:text-purple-700 font-medium ml-1"
                    >
                      {t('auth.signUp')}
                    </button>
                  </p>
                  <p className="mt-2">{t('auth.orContinueAs')} 
                    <button 
                      onClick={() => setCurrentMode('guest')}
                      className="text-purple-600 hover:text-purple-700 font-medium ml-1"
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
                      onClick={() => setCurrentMode('login')}
                      className="text-purple-600 hover:text-purple-700 font-medium ml-1"
                    >
                      {t('auth.signIn')}
                    </button>
                  </p>
                  <p className="mt-2">{t('auth.orContinueAs')} 
                    <button 
                      onClick={() => setCurrentMode('guest')}
                      className="text-purple-600 hover:text-purple-700 font-medium ml-1"
                    >
                      {t('auth.guest')}
                    </button>
                  </p>
                </>
              )}
              {currentMode === 'guest' && (
                <p>{t('auth.haveAccount')} 
                  <button 
                    onClick={() => setCurrentMode('login')}
                    className="text-purple-600 hover:text-purple-700 font-medium ml-1"
                  >
                    {t('auth.signIn')}
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
