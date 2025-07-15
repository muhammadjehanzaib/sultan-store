'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-12 h-12',
    lg: 'w-20 h-20'
  };

  return (
    <div className={`inline-block animate-spin rounded-full border-4 border-t-4 border-t-blue-500 border-b-purple-500 border-x-transparent shadow-lg bg-gradient-to-tr from-blue-400 to-purple-500 opacity-0 animate-fadeIn ${sizeClasses[size]} ${className}`}
      style={{ animationDuration: '1s' }}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};
