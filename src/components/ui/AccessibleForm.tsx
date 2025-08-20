'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

// Types
interface FormFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'textarea';
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  autoComplete?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  helperText?: string;
  showPasswordToggle?: boolean;
  rows?: number;
  className?: string;
  'aria-describedby'?: string;
}

interface ValidationRule {
  validate: (value: string) => boolean;
  message: string;
}

interface UseFormValidationProps {
  initialValues: Record<string, string>;
  validationRules: Record<string, ValidationRule[]>;
}

// Custom hook for form validation
export function useFormValidation({ initialValues, validationRules }: UseFormValidationProps) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (fieldName: string, value: string): string => {
    const rules = validationRules[fieldName] || [];
    
    for (const rule of rules) {
      if (!rule.validate(value)) {
        return rule.message;
      }
    }
    
    return '';
  };

  const validateAllFields = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName] || '');
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (fieldName: string, value: string) => {
    setValues(prev => ({ ...prev, [fieldName]: value }));
    
    // Clear error when user starts typing
    if (errors[fieldName] && touched[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  const handleBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    const error = validateField(fieldName, values[fieldName] || '');
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const handleSubmit = async (onSubmit: (values: Record<string, string>) => Promise<void>) => {
    setIsSubmitting(true);
    
    // Mark all fields as touched
    const allTouched = Object.keys(validationRules).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);

    if (validateAllFields()) {
      try {
        await onSubmit(values);
      } catch (error) {
        // Handle submission error
        console.error('Form submission error:', error);
      }
    } else {
      // Focus first field with error
      const firstErrorField = Object.keys(errors).find(key => errors[key]);
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField);
        if (element) {
          element.focus();
          // Announce error to screen readers
          const errorElement = document.getElementById(`${firstErrorField}-error`);
          if (errorElement) {
            errorElement.setAttribute('aria-live', 'assertive');
          }
        }
      }
    }
    
    setIsSubmitting(false);
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    validateAllFields,
    reset
  };
}

// Accessible Form Field Component
export function FormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  placeholder,
  autoComplete,
  maxLength,
  minLength,
  pattern,
  helperText,
  showPasswordToggle = false,
  rows = 3,
  className = '',
  'aria-describedby': ariaDescribedBy,
  ...props
}: FormFieldProps) {
  const { t, isRTL } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const fieldRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const fieldType = type === 'password' && showPassword ? 'text' : type;
  const hasError = Boolean(error);
  
  // Generate IDs for accessibility
  const errorId = `${id}-error`;
  const helperTextId = `${id}-helper`;
  const describedBy = [
    ariaDescribedBy,
    error ? errorId : null,
    helperText ? helperTextId : null
  ].filter(Boolean).join(' ');

  const baseInputClasses = `
    w-full px-4 py-3 border rounded-lg transition-all duration-200 
    bg-white placeholder-gray-400
    focus:outline-none focus:ring-2 focus:ring-offset-1
    disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50
    ${hasError 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
      : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
    }
    ${isRTL ? 'text-right' : 'text-left'}
    ${className}
  `.trim();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    if (onBlur) {
      onBlur();
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    // Keep focus on input after toggling
    if (fieldRef.current) {
      fieldRef.current.focus();
    }
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      <label 
        htmlFor={id}
        className={`block text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}
      >
        {label}
        {required && (
          <span 
            className="ml-1 text-red-500"
            aria-label="required"
          >
            *
          </span>
        )}
      </label>

      {/* Input Container */}
      <div className="relative">
        {type === 'textarea' ? (
          <textarea
            ref={fieldRef as React.RefObject<HTMLTextAreaElement>}
            id={id}
            value={value}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onFocus={() => setIsFocused(true)}
            disabled={disabled}
            required={required}
            placeholder={placeholder}
            maxLength={maxLength}
            minLength={minLength}
            rows={rows}
            className={baseInputClasses}
            aria-invalid={hasError}
            aria-describedby={describedBy || undefined}
            aria-required={required}
            {...props}
          />
        ) : (
          <input
            ref={fieldRef as React.RefObject<HTMLInputElement>}
            id={id}
            type={fieldType}
            value={value}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onFocus={() => setIsFocused(true)}
            disabled={disabled}
            required={required}
            placeholder={placeholder}
            autoComplete={autoComplete}
            maxLength={maxLength}
            minLength={minLength}
            pattern={pattern}
            className={baseInputClasses}
            aria-invalid={hasError}
            aria-describedby={describedBy || undefined}
            aria-required={required}
            {...props}
          />
        )}

        {/* Password Toggle Button */}
        {type === 'password' && showPasswordToggle && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className={`absolute top-1/2 transform -translate-y-1/2 px-3 py-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 rounded ${
              isRTL ? 'left-0' : 'right-0'
            }`}
            aria-label={showPassword ? t('form.hidePassword') || 'Hide password' : t('form.showPassword') || 'Show password'}
            tabIndex={0}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M14.12 14.12l1.414 1.414M3 3l18 18" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Helper Text */}
      {helperText && !error && (
        <p 
          id={helperTextId}
          className={`text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}
        >
          {helperText}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <div
          id={errorId}
          className={`text-sm text-red-600 ${isRTL ? 'text-right' : 'text-left'}`}
          role="alert"
          aria-live="polite"
        >
          <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {/* Character Counter */}
      {maxLength && value && (
        <div className={`text-xs text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );
}

// Accessible Submit Button
export function SubmitButton({
  children,
  isLoading = false,
  disabled = false,
  className = '',
  loadingText,
  ...props
}: {
  children: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  loadingText?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { t } = useLanguage();
  
  return (
    <button
      type="submit"
      disabled={disabled || isLoading}
      className={`
        w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white 
        bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-purple-600
        transition-all duration-200
        ${className}
      `}
      aria-disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg 
          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      <span>
        {isLoading ? (loadingText || t('common.loading') || 'Loading...') : children}
      </span>
      
      {/* Screen reader only loading announcement */}
      {isLoading && (
        <span className="sr-only">
          {t('form.submitting') || 'Form is being submitted'}
        </span>
      )}
    </button>
  );
}

// Form Group for better organization
export function FormGroup({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <fieldset className={`space-y-6 ${className}`}>
      {children}
    </fieldset>
  );
}

// Form Section with Legend
export function FormSection({ 
  legend, 
  children, 
  className = '' 
}: { 
  legend?: string; 
  children: React.ReactNode; 
  className?: string; 
}) {
  const { isRTL } = useLanguage();
  
  return (
    <fieldset className={`space-y-4 ${className}`}>
      {legend && (
        <legend className={`text-lg font-medium text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
          {legend}
        </legend>
      )}
      {children}
    </fieldset>
  );
}

// Common validation rules
export const validationRules = {
  required: (message = 'This field is required'): ValidationRule => ({
    validate: (value: string) => value.trim().length > 0,
    message
  }),

  email: (message = 'Please enter a valid email address'): ValidationRule => ({
    validate: (value: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return !value || emailRegex.test(value);
    },
    message
  }),

  minLength: (length: number, message?: string): ValidationRule => ({
    validate: (value: string) => !value || value.length >= length,
    message: message || `Minimum ${length} characters required`
  }),

  maxLength: (length: number, message?: string): ValidationRule => ({
    validate: (value: string) => value.length <= length,
    message: message || `Maximum ${length} characters allowed`
  }),

  phone: (message = 'Please enter a valid phone number'): ValidationRule => ({
    validate: (value: string) => {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      return !value || phoneRegex.test(value.replace(/\s/g, ''));
    },
    message
  }),

  password: (message = 'Password must be at least 8 characters with uppercase, lowercase, and numbers'): ValidationRule => ({
    validate: (value: string) => {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
      return !value || passwordRegex.test(value);
    },
    message
  })
};
