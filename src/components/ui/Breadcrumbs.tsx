'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ 
  items, 
  className = '' 
}) => {
  const { isRTL } = useLanguage();
  
  if (!items.length) return null;
  
  return (
    <nav 
      className={`flex ${className}`} 
      aria-label="Breadcrumb"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <ol className={`flex items-center space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={index} className="flex items-center">
              {/* Separator */}
              {index > 0 && (
                <svg 
                  className={`w-4 h-4 text-gray-400 ${isRTL ? 'ml-2 rotate-180' : 'mr-2'}`} 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                    clipRule="evenodd" 
                  />
                </svg>
              )}
              
              {/* Breadcrumb Item */}
              {isLast || !item.href ? (
                <span className={`font-medium ${
                  isLast ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {item.label}
                </span>
              ) : (
                <Link 
                  href={item.href} 
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
