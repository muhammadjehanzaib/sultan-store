'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrentPage?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  const { isRTL } = useLanguage();

  return (
    <nav className={`text-sm ${className}`} aria-label="Breadcrumb">
      <ol className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
        {items.map((item, index) => (
          <li key={index} className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
            {index > 0 && (
              <span className="text-gray-400" aria-hidden="true">
                {isRTL ? '←' : '→'}
              </span>
            )}
            {item.href && !item.isCurrentPage ? (
              <Link
                href={item.href}
                className="text-gray-600 hover:text-purple-600 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span 
                className={`${item.isCurrentPage ? 'text-purple-600 font-medium' : 'text-gray-600'}`}
                aria-current={item.isCurrentPage ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
