'use client';

import { useLanguage } from '@/contexts/LanguageContext';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, placeholder }: SearchBarProps) {
  const { t } = useLanguage();

  return (
    <div className="w-full max-w-md">
      <input
        type="text"
        placeholder={placeholder || t('admin.products.searchPlaceholder')}
        onChange={(e) => onSearch(e.target.value)}
        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
}
