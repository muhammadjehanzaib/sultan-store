'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface LanguageSwitcherProps {
  variant?: 'minimal' | 'button';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'minimal',
}) => {
  const { language, setLanguage, t, isRTL } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const getCurrentLanguageLabel = () => {
    return language === 'en' ? t('language.arabic') : t('language.english');
  };

  const getNextLanguageLabel = () => {
    return language === 'en' ? t('language.arabic') : t('language.english');
  };

  const baseClass =
    variant === 'button'
      ? 'w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded-lg shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors'
      : 'flex items-center px-3 py-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors';

  return (
    <button
      onClick={toggleLanguage}
      className={`${baseClass} ${isRTL ? 'flex-row-reverse' : ''}`}
      aria-label={`${t('language.switchTo')}`.replace('{{language}}', getNextLanguageLabel())}
      title={`${t('language.switchTo')}`.replace('{{language}}', getNextLanguageLabel())}
    >
      <span className="text-sm font-medium">{getCurrentLanguageLabel()}</span>
    </button>
  );
};
