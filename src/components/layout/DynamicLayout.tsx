'use client';

import React, { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface DynamicLayoutProps {
  children: React.ReactNode;
}

export const DynamicLayout: React.FC<DynamicLayoutProps> = ({ children }) => {
  const { language, isRTL } = useLanguage();

  useEffect(() => {
    // Update document attributes for RTL support
    document.documentElement.lang = language;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    
    // Update document title based on language
    if (language === 'ar') {
      document.title = 'السلامة السعودية - متجرك الإلكتروني';
    } else {
      document.title = 'Saudi Safety - Your Online Store';
    }
  }, [language, isRTL]);

  return (
    <div 
      className={`min-h-screen ${isRTL ? 'rtl' : 'ltr'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {children}
    </div>
  );
};
