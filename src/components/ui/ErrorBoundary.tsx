'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
}

interface ErrorFallbackProps {
  error?: Error;
  resetError: () => void;
  hasError: boolean;
}

// Generic Error Boundary Component
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log to error reporting service
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    } else {
      // Default logging
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys } = this.props;
    const { hasError } = this.state;

    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetKeys?.some((key, idx) => prevProps.resetKeys?.[idx] !== key)) {
        this.resetErrorBoundary();
      }
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.resetTimeoutId = setTimeout(() => {
      this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    }, 100);
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback: Fallback } = this.props;

    if (hasError) {
      if (Fallback) {
        return <Fallback error={error} resetError={this.resetErrorBoundary} hasError={hasError} />;
      }
      return <DefaultErrorFallback error={error} resetError={this.resetErrorBoundary} hasError={hasError} />;
    }

    return children;
  }
}

// Default Error Fallback Component
function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const { t } = useLanguage();

  return (
    <div 
      className="min-h-[400px] flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
      role="alert"
      aria-live="assertive"
    >
      <div className="text-center p-8">
        <div className="mb-6">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('error.somethingWentWrong') || 'Something went wrong'}
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            {t('error.tryAgainMessage') || 'We encountered an unexpected error. Please try again.'}
          </p>
        </div>
        
        <button
          onClick={resetError}
          className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          aria-label="Try again"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {t('error.tryAgain') || 'Try Again'}
        </button>

        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Developer Details
            </summary>
            <pre className="mt-2 text-xs text-red-600 bg-red-50 p-3 rounded overflow-auto max-h-32">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

// Product-specific Error Fallback
function ProductErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const { t } = useLanguage();

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center"
      role="alert"
      aria-live="assertive"
    >
      <div className="mb-4">
        <svg className="w-12 h-12 text-orange-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('product.loadError') || 'Product Unavailable'}
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          {t('product.loadErrorMessage') || 'This product could not be loaded. Please try refreshing.'}
        </p>
      </div>
      
      <button
        onClick={resetError}
        className="inline-flex items-center px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
        aria-label="Reload product"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        {t('common.reload') || 'Reload'}
      </button>
    </div>
  );
}

// Cart-specific Error Fallback
function CartErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const { t } = useLanguage();

  return (
    <div 
      className="p-6 text-center bg-red-50 border border-red-200 rounded-lg"
      role="alert"
      aria-live="assertive"
    >
      <div className="mb-4">
        <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('cart.error') || 'Cart Error'}
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          {t('cart.errorMessage') || 'There was a problem with your cart. Please refresh and try again.'}
        </p>
      </div>
      
      <button
        onClick={resetError}
        className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200"
        aria-label="Refresh cart"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        {t('cart.refresh') || 'Refresh Cart'}
      </button>
    </div>
  );
}

// Admin Dashboard Error Fallback
function AdminErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const { t } = useLanguage();

  return (
    <div 
      className="min-h-[500px] flex items-center justify-center bg-gray-50 rounded-lg border"
      role="alert"
      aria-live="assertive"
    >
      <div className="text-center p-8 max-w-md">
        <div className="mb-6">
          <svg className="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('admin.error') || 'Dashboard Error'}
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            {t('admin.errorMessage') || 'Unable to load dashboard data. This might be a temporary issue.'}
          </p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={resetError}
            className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            aria-label="Reload dashboard"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {t('admin.reloadDashboard') || 'Reload Dashboard'}
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full inline-flex items-center justify-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200"
            aria-label="Refresh page"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.183m0-3.183v4.993m0 0h-4.993m4.993 0l-3.181-3.183" />
            </svg>
            {t('common.refreshPage') || 'Refresh Page'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Specific Error Boundary Components
export function ProductErrorBoundary({ children, ...props }: Omit<ErrorBoundaryProps, 'fallback'>) {
  return (
    <ErrorBoundary {...props} fallback={ProductErrorFallback}>
      {children}
    </ErrorBoundary>
  );
}

export function CartErrorBoundary({ children, ...props }: Omit<ErrorBoundaryProps, 'fallback'>) {
  return (
    <ErrorBoundary {...props} fallback={CartErrorFallback}>
      {children}
    </ErrorBoundary>
  );
}

export function AdminErrorBoundary({ children, ...props }: Omit<ErrorBoundaryProps, 'fallback'>) {
  return (
    <ErrorBoundary {...props} fallback={AdminErrorFallback}>
      {children}
    </ErrorBoundary>
  );
}

// Hook for error handling
export function useErrorHandler() {
  const { t } = useLanguage();
  
  const handleError = React.useCallback((error: Error, context?: string) => {
    // Log error
    console.error(`Error in ${context || 'component'}:`, error);
    
    // You can integrate with error reporting services here
    // Example: Sentry.captureException(error, { contexts: { component: context } });
    
    return {
      message: t('error.generic') || 'An unexpected error occurred',
      canRetry: true
    };
  }, [t]);

  return { handleError };
}

// Error Alert Component for non-boundary errors
export function ErrorAlert({ 
  message, 
  onClose, 
  canRetry = false, 
  onRetry,
  type = 'error' 
}: {
  message: string;
  onClose?: () => void;
  canRetry?: boolean;
  onRetry?: () => void;
  type?: 'error' | 'warning' | 'info';
}) {
  const { t } = useLanguage();
  
  const alertStyles = {
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const iconStyles = {
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  };

  return (
    <div 
      className={`border rounded-lg p-4 ${alertStyles[type]}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className={`w-5 h-5 ${iconStyles[type]}`} fill="currentColor" viewBox="0 0 20 20">
            {type === 'error' && (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            )}
            {type === 'warning' && (
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            )}
            {type === 'info' && (
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            )}
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{message}</p>
          {canRetry && onRetry && (
            <div className="mt-2">
              <button
                onClick={onRetry}
                className="text-sm underline hover:no-underline focus:outline-none"
              >
                {t('error.tryAgain') || 'Try Again'}
              </button>
            </div>
          )}
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className="inline-flex rounded-md p-1.5 hover:bg-opacity-20 hover:bg-gray-600 focus:outline-none"
              aria-label="Close alert"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
